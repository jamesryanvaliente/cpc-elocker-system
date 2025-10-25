const connection = require('../database/connection');
const { logActivity } = require('./auditlog');

// approve rental
const approveRental = async (req, res) => {
  const { rental_id, months, paid_months, payment_method, remarks } = req.body;
  const adminId = req.user.user_id;
  const adminName = req.user.username;

  if (!rental_id) {
    return res.status(400).json({ error: 'Rental ID is required' });
  }

  try {
    // ✅ fetch rental + latest payment + locker name
    const [rows] = await connection.query(
        `SELECT lr.*, l.locker_number AS locker_name, lp.amount_paid, lp.verified,
        u.user_id, u.f_name, u.m_name, u.l_name
        FROM locker_rentals lr
        JOIN lockers l ON lr.locker_id = l.locker_id
        LEFT JOIN locker_payments lp ON lp.rental_id = lr.rental_id
        LEFT JOIN users u ON lr.user_id = u.user_id
        WHERE lr.rental_id = ? AND lr.status IN ("pending", "reserved")
        ORDER BY lp.payment_id DESC
        LIMIT 1`,
        [rental_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pending rental not found' });
    }

    const rental = rows[0];

    // ===== EXPIRY CHECK =====
    const currentTime = new Date();
    if (rental.reserve_expiry && new Date(rental.reserve_expiry) < currentTime) {
      await connection.query(
        `UPDATE locker_rentals 
         SET status = 'expired', cancelled_at = NOW()
         WHERE rental_id = ?`,
        [rental_id]
      );

      await connection.query(
        `UPDATE lockers 
         SET status = 'available',
             assigned_to = NULL,
             rented_date = NULL,
             due_date = NULL,
             reserved_date = NULL,
             reserve_expiry = NULL
         WHERE locker_id = ?`,
        [rental.locker_id]
      );

      return res.status(400).json({
        error: 'This rental request has expired and cannot be approved.'
      });
    }
    // ===== END EXPIRY CHECK =====

    const ratePerMonth = 60;
    const startDate = new Date();
    const monthsToUse = rental.months;
    const total = rental.total_amount;

    const paidToUse = rental.paid_amount || 0;
    const balance = rental.balance || 0;

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + monthsToUse);

    // === update rental ===
    await connection.query(
      `UPDATE locker_rentals 
       SET status = 'active',  
           start_date = ?, 
           due_date = ?
       WHERE rental_id = ?`,
      [startDate, endDate, rental_id]
    );

    // === if payment method is qr, update locker_payments verification ===
    if (payment_method === 'qr') {
      await connection.query(
        `UPDATE locker_payments 
         SET verified = 1,
             verified_by = ?
         WHERE rental_id = ?
         ORDER BY payment_id DESC
         LIMIT 1`,
        [adminId, rental_id]
      );
    }

    // // === insert payment record if paid_months provided ===
    // if (paid_months && paid_months > 0) {
    //   await connection.query(
    //     `INSERT INTO locker_payments (rental_id, user_id, amount_paid, payment_method, payment_date, remarks)
    //      VALUES (?, ?, ?, ?, NOW(), ?)`,
    //     [
    //       rental_id,
    //       rental.user_id,
    //       paidToUse,
    //       payment_method || rental.payment_method || 'cash',
    //       remarks || 'initial payment upon approval'
    //     ]
    //   );
    // }

    // === update locker table ===
    await connection.query(
      `UPDATE lockers 
       SET status = 'rented',
           assigned_to = ?,
           rented_date = ?,
           due_date = ?,
           reserved_date = NULL,
           reserve_expiry = NULL
       WHERE locker_id = ?`,
      [rental.user_id, startDate, endDate, rental.locker_id]
    );

    // === insert verified payment record if cash ===
    if (payment_method === 'cash') {
      await connection.query(
        `INSERT INTO locker_payments 
        (rental_id, user_id, amount_paid, payment_method, payment_date, verified, verified_by, remarks)
        VALUES (?, ?, ?, 'cash', NOW(), 1, ?, 'cash approval record')`,
        [rental_id, rental.user_id, paidToUse, adminId]
      );
    }

    const studentName = `${rows[0].f_name} ${rows[0].m_name} ${rows[0].l_name}`;

    // === audit log ===
    await logActivity(
      adminId,
      adminName,
      `Approved rental for Locker ${rental.locker_name} of student ${studentName}`
    );

    res.status(200).json({
      message: 'Rental approved successfully',
      rental_id,
      months: monthsToUse,
      total,
      paid_amount: paidToUse,
      balance
    });
  } catch (error) {
    console.error('Error approving rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// force cancel rental (for admin)
const cancelRental = async (req, res) => {
  const { rental_id } = req.body;
  const adminId = req.user.user_id;
  const adminName = req.user.username;

  if (!rental_id) {
    return res.status(400).json({ error: 'Rental ID is required' });
  }

  try {
    const [rows] = await connection.query(
      `SELECT lr.*, l.locker_number AS locker_name 
       FROM locker_rentals lr
       JOIN lockers l ON lr.locker_id = l.locker_id
       WHERE lr.rental_id = ? AND lr.status IN ('pending', 'Pending', 'PENDING')`,
      [rental_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pending rental not found' });
    }

    const rental = rows[0];

    await connection.query(
      `UPDATE locker_rentals 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE rental_id = ?`,
      [rental_id]
    );

    await connection.query(
      `UPDATE lockers 
       SET status = 'available',
           assigned_to = NULL,
           rented_date = NULL,
           due_date = NULL,
           reserved_date = NULL,
           reserve_expiry = NULL
       WHERE locker_id = ?`,
      [rental.locker_id]
    );

    await connection.query(
      `INSERT INTO notifications (user_id, message, type) 
       VALUES (?, ?, 'warning')`,
      [
        rental.user_id,
        `Your locker rent request (Locker ${rental.locker_name}) was cancelled by the admin because payment was not completed.`
      ]
    );

    await logActivity(
      adminId,
      adminName,
      `Cancelled rental for Locker ${rental.locker_name}`
    );

    res.status(200).json({ message: 'Rental cancelled and locker freed, notification sent' });
  } catch (error) {
    console.error('Error cancelling rental:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { approveRental, cancelRental };