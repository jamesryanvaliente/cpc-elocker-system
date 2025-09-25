const connection = require('../database/connection');
const { logActivity } = require('./auditlog');

// approve rental
const approveRental = async (req, res) => {
    const { rental_id, months, paid_months } = req.body;
    const adminId = req.user.user_id;
    const adminName = req.user.username;

    if (!rental_id) {
        return res.status(400).json({ error: 'Rental ID is required' });
    }

    try {
        // fetch rental + locker name
        const [rows] = await connection.query(
            `SELECT lr.*, l.locker_number AS locker_name
             FROM locker_rentals lr
             JOIN lockers l ON lr.locker_id = l.locker_id
             WHERE lr.rental_id = ? AND lr.status IN ("pending", "reserved")`,
            [rental_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pending rental is not found' });
        }

        const rental = rows[0];

        // ===== EXPIRY CHECK =====
        // Check if the rental has expired
        const currentTime = new Date();
        if (rental.reserve_expiry && new Date(rental.reserve_expiry) < currentTime) {
            // Automatically expire the rental
            await connection.query(
                `UPDATE locker_rentals 
                SET status = 'expired',
                cancelled_at = NOW()
                WHERE rental_id = ?`,
                [rental_id]
            );

            // Make locker available
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
        // ===== END OF EXPIRY CHECK =====

        const startDate = new Date();
        let endDate = new Date();

        let monthsToUse = rental.months;
        let paidToUse = rental.paid_amount || 0;
        let total = rental.total_amount || 0;
        let balance = rental.balance || 0;

        const ratePerMonth = 60;

        if (rental.action_type === 'reserve') {
            if (!months || !paid_months) {
                return res.status(400).json({ error: 'Months and paid months are required for reservation approval' });
            }

            monthsToUse = months;
            paidToUse = paid_months * ratePerMonth;
            total = months * ratePerMonth;
            balance = total - paidToUse;
        }

        endDate.setMonth(startDate.getMonth() + monthsToUse);

        await connection.query(
            `UPDATE locker_rentals 
            SET months = ?, 
            total_amount = ?, 
            paid_amount = ?, 
            balance = ?, 
            start_date = ?, 
            due_date = ?, 
            status = 'active' 
            WHERE rental_id = ?`,
            [monthsToUse, total, paidToUse, balance, startDate, endDate, rental_id]
        );

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

        // audit log with locker name
        await logActivity(adminId, adminName, `Approved rental for Locker ${rental.locker_name}`);
        // await logActivity(adminId, adminName, `Approved rental (rental_id: ${rental_id}, locker_id: ${rental.locker_id})`);

        res.status(200).json({ message: 'Rental approved successfully' });
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
        // check if rental exists and is pending
        const [rows] = await connection.query(
            `SELECT lr.*, l.locker_number AS locker_name 
             FROM locker_rentals lr
             JOIN lockers l ON lr.locker_id = l.locker_id
             WHERE lr.rental_id = ? AND lr.status = "pending"`,
            [rental_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pending rental not found' });
        }

        const rental = rows[0];

        // update rental status
        await connection.query(
            `UPDATE locker_rentals 
             SET status = 'cancelled',
                 cancelled_at = NOW()
             WHERE rental_id = ?`,
            [rental_id]
        );

        // free the locker
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

        // insert dashboard notification
        await connection.query(
            `INSERT INTO notifications (user_id, message, type) 
             VALUES (?, ?, 'warning')`,
            [
                rental.user_id,
                `Your locker rent request (Locker #${rental.locker_id}) was cancelled by the admin because payment was not completed.`
            ]
        );

        // audit log with locker name
        await logActivity(adminId, adminName, `Cancelled rental for Locker ${rental.locker_name}`);
        // await logActivity(adminId, adminName, `Cancelled rental (rental_id: ${rental_id}, locker_id: ${rental.locker_id})`);

        res.status(200).json({ message: 'Rental cancelled and locker freed, notification sent' });
    } catch (error) {
        console.error('Error cancelling rental:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { approveRental, cancelRental };