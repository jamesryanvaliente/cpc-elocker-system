const connection = require('../database/connection');
const { logActivity } = require('./auditlog');

// ========== locker transaction (rent or reserve) ==========

const lockerTransaction = async (req, res) => {
  const { locker_id, months, paid_months, payment_method, action_type, student_id } = req.body;
  const user_id = req.user.user_id;
  const role = req.user.role;
  const adminName = req.user.username;

  if (!locker_id || !payment_method) {
    return res.status(400).json({ error: 'Locker ID and payment method are required' });
  }

  // --- if admin ---
  // if (role === 'admin') {
  //   try {
  //     if (action_type !== 'rent') {
  //       return res.status(400).json({ error: 'Admins can only assign rentals, not reservations.' });
  //     }

  //     if (!student_id) {
  //       return res.status(400).json({ error: 'Student ID is required to assign a locker.' });
  //     }

  //     // check if student exists
  //     const [studentRows] = await connection.query(
  //       'SELECT user_id, f_name, m_name, l_name, stud_id FROM users WHERE stud_id = ?',
  //       [student_id]
  //     );

  //     if (studentRows.length === 0) {
  //       return res.status(404).json({ error: 'No user found with this student ID.' });
  //     }

  //     const targetUser = studentRows[0];
  //     const targetUserId = targetUser.user_id;
  //     const studentName = [targetUser.f_name, targetUser.m_name, targetUser.l_name]
  //       .filter(Boolean) // remove null/empty values
  //       .join(' ');

  //     // enforce locker limit (max 2 lockers per student)
  //     const [userLockers] = await connection.query(
  //       'SELECT COUNT(*) AS count FROM lockers WHERE assigned_to = ? AND status IN ("rented", "pending", "reserved")',
  //       [targetUserId]
  //     );

  //     if (userLockers[0].count >= 2) {
  //       return res.status(400).json({ error: 'This student has reached the maximum locker limit (2)' });
  //     }

  //     // check locker availability
  //     const [lockerRows] = await connection.query(
  //       'SELECT * FROM lockers WHERE locker_id = ?',
  //       [locker_id]
  //     );

  //     if (lockerRows.length === 0) {
  //       return res.status(404).json({ error: 'Locker not found' });
  //     }

  //     const locker = lockerRows[0];
  //     const lockerName = locker.locker_number;

  //     if (['rented', 'pending', 'reserved'].includes(locker.status)) {
  //       return res.status(400).json({ error: 'This locker is already assigned to another student.' });
  //     }

  //     // prevent duplicate rental for same locker by same student
  //     const [existingRental] = await connection.query(
  //       `SELECT * FROM locker_rentals
  //        WHERE locker_id = ? 
  //        AND user_id = ? 
  //        AND status IN ('active', 'pending', 'reserved')`,
  //       [locker_id, targetUserId]
  //     );

  //     if (existingRental.length > 0) {
  //       return res.status(400).json({
  //         error: 'This student already has an active or pending reservation for this locker.'
  //       });
  //     }

  //     // rental calculation
  //     const ratePerMonth = 60;
  //     const total = months * ratePerMonth;
  //     const paid = paid_months * ratePerMonth;
  //     const balance = total - paid;

  //     let rentStatus, lockerStatus;
  //     if (payment_method === 'qr') {
  //       rentStatus = 'active';
  //       lockerStatus = 'rented';
  //     } else {
  //       rentStatus = 'pending';
  //       lockerStatus = 'pending';
  //     }

  //     // update locker
  //     await connection.query(
  //       `UPDATE lockers
  //        SET status = ?,
  //            assigned_to = ?,
  //            rented_date = NOW(),
  //            due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
  //        WHERE locker_id = ?`,
  //       [lockerStatus, targetUserId, months, locker_id]
  //     );

  //     // insert rental record
  //     await connection.query(
  //       `INSERT INTO locker_rentals
  //       (locker_id, user_id, months, start_date, due_date, total_amount, paid_amount, balance, payment_method, status, action_type)
  //       VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH), ?, ?, ?, ?, ?, ?)`,
  //       [locker_id, targetUserId, months, months, total, paid, balance, payment_method, rentStatus, 'rent']
  //     );

  //     // log activity
  //     await logActivity(
  //       user_id,
  //       adminName,
  //       `Assigned locker ${lockerName} to student: ${studentName} (Student ID: ${targetUser.stud_id})`
  //     );

  //     return res.status(200).json({
  //       message: `Locker successfully assigned to student ID ${targetUser.stud_id}.`
  //     });

  //   } catch (error) {
  //     console.error('Error during admin locker assignment:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  // --- if admin ---
if (role === 'admin') {
  try {
    if (action_type !== 'rent') {
      return res.status(400).json({ error: 'Admins can only assign rentals, not reservations.' });
    }

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required to assign a locker.' });
    }

    // check if student exists
    const [studentRows] = await connection.query(
      'SELECT user_id, f_name, m_name, l_name, stud_id FROM users WHERE stud_id = ?',
      [student_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'No user found with this student ID.' });
    }

    const targetUser = studentRows[0];
    const targetUserId = targetUser.user_id;
    const studentName = [targetUser.f_name, targetUser.m_name, targetUser.l_name]
      .filter(Boolean)
      .join(' ');

    // enforce locker limit (max 2 lockers per student)
    const [userLockers] = await connection.query(
      'SELECT COUNT(*) AS count FROM lockers WHERE assigned_to = ? AND status IN ("rented", "pending", "reserved")',
      [targetUserId]
    );

    if (userLockers[0].count >= 2) {
      return res.status(400).json({ error: 'This student has reached the maximum locker limit (2)' });
    }

    // check locker availability
    const [lockerRows] = await connection.query(
      'SELECT * FROM lockers WHERE locker_id = ?',
      [locker_id]
    );

    if (lockerRows.length === 0) {
      return res.status(404).json({ error: 'Locker not found' });
    }

    const locker = lockerRows[0];
    const lockerName = locker.locker_number;

    if (['rented', 'pending', 'reserved'].includes(locker.status)) {
      return res.status(400).json({ error: 'This locker is already assigned to another student.' });
    }

    // prevent duplicate rental for same locker by same student
    const [existingRental] = await connection.query(
      `SELECT * FROM locker_rentals
       WHERE locker_id = ? 
       AND user_id = ? 
       AND status IN ('active', 'pending', 'reserved')`,
      [locker_id, targetUserId]
    );

    if (existingRental.length > 0) {
      return res.status(400).json({
        error: 'This student already has an active or pending reservation for this locker.'
      });
    }

    // rental calculation
    const ratePerMonth = 60;
    const total = months * ratePerMonth;
    const paid = paid_months * ratePerMonth;
    const balance = total - paid;

    let rentStatus, lockerStatus;
    if (payment_method === 'qr') {
      rentStatus = 'active';
      lockerStatus = 'rented';
    } else {
      rentStatus = 'pending';
      lockerStatus = 'pending';
    }

    // update locker
    if (payment_method === 'qr') {
      // immediate full rental
      await connection.query(
        `UPDATE lockers
         SET status = ?,
             assigned_to = ?,
             rented_date = NOW(),
             due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE locker_id = ?`,
        [lockerStatus, targetUserId, months, locker_id]
      );
    } else {
      // cash or other → give 2-day expiry
      await connection.query(
        `UPDATE lockers
         SET status = ?,
             assigned_to = ?,
             rented_date = NOW(),
             reserve_expiry = DATE_ADD(NOW(), INTERVAL 2 DAY),
             due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE locker_id = ?`,
        [lockerStatus, targetUserId, months, locker_id]
      );
    }

    // insert rental record
    await connection.query(
      `INSERT INTO locker_rentals
      (locker_id, user_id, months, start_date, due_date, total_amount, paid_amount, balance, payment_method, status, action_type)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH), ?, ?, ?, ?, ?, ?)`,
      [locker_id, targetUserId, months, months, total, paid, balance, payment_method, rentStatus, 'rent']
    );

    // log activity
    await logActivity(
      user_id,
      adminName,
      `Assigned locker ${lockerName} to student: ${studentName} (Student ID: ${targetUser.stud_id})`
    );

    return res.status(200).json({
      message: payment_method === 'qr'
        ? `Locker successfully assigned and active for student ID ${targetUser.stud_id}.`
        : `Locker assigned to student ID ${targetUser.stud_id}. They must pay within 2 days or the locker will be released.`
    });

  } catch (error) {
    console.error('Error during admin locker assignment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

  // --- if normal user (student) ---
  if (!action_type) {
    return res.status(400).json({ error: 'Action type is required' });
  }

  if (action_type === 'rent' && (!months || !paid_months)) {
    return res.status(400).json({ error: 'Months and paid months are required for rental' });
  }

  if (action_type === 'reserve' && payment_method === 'qr') {
    return res.status(400).json({ error: 'QR payment is not supported for reservations.' });
  }

  if (!['rent', 'reserve'].includes(action_type)) {
    return res.status(400).json({ error: 'Invalid action type. Must be rent or reserve' });
  }

  let monthsValue = null;
  let total = null;
  let paid = null;
  let balance = null;

  if (action_type === 'rent') {
    const ratePerMonth = 60;
    monthsValue = months;
    total = months * ratePerMonth;
    paid = paid_months * ratePerMonth;
    balance = total - paid;
  }

  let rentStatus;
  let lockerStatus;

  if (action_type === 'reserve') {
    rentStatus = 'reserved';
    lockerStatus = 'reserved';
  } else if (action_type === 'rent') {
    if (payment_method === 'qr') {
      rentStatus = 'active';
      lockerStatus = 'rented';
    } else {
      rentStatus = 'pending';
      lockerStatus = 'pending';
    }
  }

  try {
    const [userLockers] = await connection.query(
      'SELECT COUNT(*) AS count FROM lockers WHERE assigned_to = ? AND status IN ("rented", "pending")',
      [user_id]
    );

    if (userLockers[0].count >= 2) {
      return res.status(400).json({ error: 'You have reached the maximum locker limit (2)' });
    }

    const [lockerRows] = await connection.query(
      'SELECT * FROM lockers WHERE locker_id = ?',
      [locker_id]
    );

    if (lockerRows.length === 0) {
      return res.status(404).json({ error: 'Locker not found' });
    }

    const locker = lockerRows[0];

    if (locker.status === 'rented') {
      return res.status(400).json({ error: 'Locker is already rented for another user.' });
    }

    if (['reserved', 'pending'].includes(locker.status) && locker.assigned_to !== user_id) {
      return res.status(400).json({ error: 'Locker is already reserved for another user.' });
    }

    const [existingRental] = await connection.query(
      `SELECT * FROM locker_rentals
       WHERE locker_id = ? 
       AND user_id = ? 
       AND status IN ('active', 'pending', 'reserved')`,
      [locker_id, user_id]
    );

    if (existingRental.length > 0) {
      return res.status(400).json({
        error: 'You already have an active or pending reservation for this locker.'
      });
    }

    // Update locker table
    if (action_type === 'reserve') {
      await connection.query(
        `UPDATE lockers
         SET status = 'reserved',
             assigned_to = ?,
             reserved_date = NOW(),
             reserve_expiry = DATE_ADD(NOW(), INTERVAL 2 DAY)
         WHERE locker_id = ?`,
        [user_id, locker_id]
      );
    } else if (action_type === 'rent' && payment_method === 'cash') {
      // Cash rentals have 2-day expiry for payment, then full rental period starts
      await connection.query(
        `UPDATE lockers
         SET status = ?,
             assigned_to = ?,
             rented_date = NOW(),
             reserve_expiry = DATE_ADD(NOW(), INTERVAL 2 DAY),
             due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE locker_id = ?`,
        [lockerStatus, user_id, months, locker_id]
      );
    } else {
      // QR rentals are immediately active with full rental period
      await connection.query(
        `UPDATE lockers
         SET status = ?,
             assigned_to = ?,
             rented_date = NOW(),
             due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
         WHERE locker_id = ?`,
        [lockerStatus, user_id, months, locker_id]
      );
    }

    // Insert into locker_rentals table - FIXED
    if (action_type === 'reserve') {
      // For reservations, don't set due_date with months calculation
      await connection.query(
        `INSERT INTO locker_rentals
        (locker_id, user_id, months, start_date, due_date, total_amount, paid_amount, balance, payment_method, status, action_type)
        VALUES (?, ?, ?, NOW(), NULL, ?, ?, ?, ?, ?, ?)`,
        [locker_id, user_id, monthsValue, total, paid, balance, payment_method, rentStatus, action_type]
      );
    } else {
      // For rentals, use months calculation for due_date
      await connection.query(
        `INSERT INTO locker_rentals
        (locker_id, user_id, months, start_date, due_date, total_amount, paid_amount, balance, payment_method, status, action_type)
        VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH), ?, ?, ?, ?, ?, ?)`,
        [locker_id, user_id, monthsValue, monthsValue, total, paid, balance, payment_method, rentStatus, action_type]
      );
    }

    return res.status(200).json({
      message: rentStatus === "active"
        ? `Locker ${action_type} successful and active.`
        : `Locker ${action_type} is pending. Please pay within 2 days or your ${action_type} will be cancelled and the locker will become available again.`
    });

  } catch (error) {
    console.error('Error during locker transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = lockerTransaction;