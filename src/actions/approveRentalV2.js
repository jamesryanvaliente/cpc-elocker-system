const connection = require('../database/connection');

// approve rental (your original code with no changes)
const approveRental = async (req, res) => {
    const { rental_id, months, paid_months } = req.body;

    if (!rental_id) {
        return res.status(400).json({ error: 'Rental ID is required' });
    }

    try {
        const [rows] = await connection.query(
            'SELECT * FROM locker_rentals WHERE rental_id = ? AND status IN ("pending", "reserved")',
            [rental_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pending rental is not found' });
        }

        const rental = rows[0];

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
        
        res.status(200).json({ message: 'Rental approved successfully' });
    } catch (error) {
        console.error('Error approving rental:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// new: force cancel rental (for admin)
const cancelRental = async (req, res) => {
    const { rental_id } = req.body;

    if (!rental_id) {
        return res.status(400).json({ error: 'Rental ID is required' });
    }

    try {
        // check if rental exists and is pending
        const [rows] = await connection.query(
            'SELECT * FROM locker_rentals WHERE rental_id = ? AND status = "pending"',
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

        res.status(200).json({ message: 'Rental cancelled and locker freed, notification sent' });
    } catch (error) {
        console.error('Error cancelling rental:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { approveRental, cancelRental };