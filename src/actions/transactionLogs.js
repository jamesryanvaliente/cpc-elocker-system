// controllers/transactionController.js
const connection = require('../database/connection');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const transactionLogs = {
    // 🧾 get all detailed transactions (with optional date filtering)
    getTransactions: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;

            let query = `
        SELECT 
          p.payment_id,
          CONCAT(u.f_name, ' ', u.l_name) AS student_name,
          u.stud_id,
          c.acronym AS course,
          l.locker_number,
          l.location,
          r.action_type,
          p.transaction_type,
          p.amount_paid,
          r.balance,
          p.payment_method,
          p.reference_number,
          p.payment_date,
          p.verified,
          p.verified_at,
          a.username AS verified_by,
          p.receipt_path,
          p.remarks AS payment_remarks
        FROM locker_payments p
        LEFT JOIN locker_rentals r ON p.rental_id = r.rental_id
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN courses c ON u.course_id = c.course_id
        LEFT JOIN lockers l ON r.locker_id = l.locker_id
        LEFT JOIN accounts a ON p.verified_by = a.account_id
      `;

            const params = [];
            if (start_date && end_date) {
                query += ' WHERE DATE(p.payment_date) BETWEEN ? AND ?';
                params.push(start_date, end_date);
            }

            query += ' ORDER BY p.payment_date DESC';

            const [results] = await connection.query(query, params);
            res.json(results);
        } catch (err) {
            console.error('❌ Error fetching transactions:', err);
            res.status(500).json({ error: 'failed to fetch transactions' });
        }
    },

    // 🧠 add a new log to transaction_logs (for rent, reserve, payment, verify, etc.)
    addTransactionLog: async (data) => {
        try {
            const {
                user_id,
                locker_id,
                rental_id,
                payment_id,
                action_type,
                payment_method,
                reference_number,
                amount,
                balance,
                remarks
            } = data;

            const query = `
        INSERT INTO transaction_logs 
        (user_id, locker_id, rental_id, payment_id, action_type, payment_method, reference_number, amount, balance, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [result] = await connection.query(query, [
                user_id, locker_id, rental_id, payment_id,
                action_type, payment_method, reference_number,
                amount, balance, remarks
            ]);

            return result;
        } catch (err) {
            console.error('❌ Error inserting transaction log:', err);
            throw err;
        }
    },

    // 📤 generate and download transactions report as pdf
    downloadTransactionsPDF: async (req, res) => {
        try {
            const { start_date, end_date } = req.query;

            let query = `
        SELECT 
          CONCAT(u.f_name, ' ', u.l_name) AS student_name,
          u.stud_id,
          c.acronym AS course,
          l.locker_number,
          p.amount_paid,
          p.payment_method,
          p.reference_number,
          p.payment_date,
          a.username AS verified_by
        FROM locker_payments p
        LEFT JOIN locker_rentals r ON p.rental_id = r.rental_id
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN courses c ON u.course_id = c.course_id
        LEFT JOIN lockers l ON r.locker_id = l.locker_id
        LEFT JOIN accounts a ON p.verified_by = a.account_id
      `;

            const params = [];
            if (start_date && end_date) {
                query += ' WHERE DATE(p.payment_date) BETWEEN ? AND ?';
                params.push(start_date, end_date);
            }
            query += ' ORDER BY p.payment_date DESC';

            const [results] = await connection.query(query, params);

            // setup pdf
            const doc = new PDFDocument({ margin: 50 });
            const filename = `transactions_${Date.now()}.pdf`;

            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);

            // register unicode font (supports ₱)
            const fontPath = path.join(__dirname, '../fonts/static/NotoSans-Regular.ttf');
            if (fs.existsSync(fontPath)) {
                doc.registerFont('NotoSans', fontPath);
                doc.font('NotoSans');
            }

            // header
            doc.fontSize(18).text('Locker Detailed Transactions Report', { align: 'center' });
            doc.moveDown(1.5);

            results.forEach(t => {
                const amount = typeof t.amount_paid === 'number'
                    ? t.amount_paid
                    : parseFloat(t.amount_paid) || 0;

                doc.fontSize(10).fillColor('#000')
                    .text(`Name: ${t.student_name || '-'} | ID: ${t.stud_id || '-'} | Course: ${t.course || '-'}`);
                doc.text(`Locker: ${t.locker_number || '-'} | Amount: ₱ ${amount.toFixed(2)} | Method: ${t.payment_method || '-'}`);
                doc.text(`Reference: ${t.reference_number || '-'} | Date: ${t.payment_date || '-'} | Verified by: ${t.verified_by || '-'}`);
                doc.moveDown(0.8);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();
            });

            // footer
            doc.moveDown(2);
            doc.fontSize(9).fillColor('#777').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

            doc.end();

        } catch (err) {
            console.error('❌ Error generating PDF:', err);
            res.status(500).json({ error: 'failed to generate pdf' });
        }
    }
};

module.exports = transactionLogs;