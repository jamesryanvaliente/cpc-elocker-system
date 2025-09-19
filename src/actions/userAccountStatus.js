const connection = require('../database/connection');

// ========== disable user account ==========
const disableUserAccount = async (req, res) => {
    try {
        const { user_id } = req.params;

        await connection.query(
            `UPDATE accounts 
             SET status = 'disable' 
             WHERE account_id = (SELECT account_id FROM users WHERE user_id = ?)`,
            [user_id]
        );

        res.json({ message: 'Account disabled' });
    } catch (error) {
        console.error('Error disabling account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ========== enable user account ==========
const enableUserAccount = async (req, res) => {
    try {
        const { user_id } = req.params;

        await connection.query(
            `UPDATE accounts 
             SET status = 'active' 
             WHERE account_id = (SELECT account_id FROM users WHERE user_id = ?)` ,
            [user_id]
        );

        res.json({ message: 'Account enabled' });
    } catch (error) {
        console.error('Error enabling account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { disableUserAccount, enableUserAccount };