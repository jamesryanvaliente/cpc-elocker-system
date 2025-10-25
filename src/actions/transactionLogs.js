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
          CONCAT(u.f_name, ' ', u.l_name) AS student_name,
          u.stud_id,
          c.acronym AS course,
          l.locker_number,
          r.action_type,
          p.transaction_type,
          COALESCE(p.amount_paid, r.paid_amount) AS amount_paid,
          COALESCE(r.balance) AS balance,
          COALESCE(p.payment_method, r.payment_method) AS payment_method,
          p.reference_number,
          COALESCE(p.payment_date, r.start_date) AS payment_date,
          p.verified,
          p.verified_at,
          a.username AS verified_by,
          p.receipt_path,
          p.remarks AS payment_remarks
        FROM locker_rentals r
        LEFT JOIN locker_payments p ON r.rental_id = p.rental_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN courses c ON u.course_id = c.course_id
        LEFT JOIN lockers l ON r.locker_id = l.locker_id
        LEFT JOIN accounts a ON p.verified_by = a.account_id
      `;

            const params = [];
            if (start_date && end_date) {
                query += ' WHERE DATE(p.payment_date) BETWEEN ? AND ?';
                params.push(start_date, end_date);
            }

            query += ' ORDER BY COALESCE(p.payment_date, r.start_date) DESC';

            const [results] = await connection.query(query, params);

            // 🧠 convert receipt blob → base64 (so frontend can display it as an image)
            const transactions = results.map(row => ({
                ...row,
                receipt_path: row.receipt_path
                ? `data:image/png;base64,${row.receipt_path.toString('base64')}`
                : null
            }));
            res.json(transactions);
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

            // paths
            const logoPath = path.join(__dirname, '../img/logo.jpg');
            const fontPath = path.join(__dirname, '../fonts/static/NotoSans-Regular.ttf');

            // --- header with logo ---
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 30, { width: 60 });
            }

            // register unicode font (supports ₱)
            if (fs.existsSync(fontPath)) {
                doc.registerFont('NotoSans', fontPath);
                doc.font('NotoSans');
            }

            doc.fontSize(20).text('CPC E-Locker System', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).fillColor('#666').text('Locker Detailed Transactions Report', { align: 'center' });
            doc.moveDown(1);

            // --- date range header ---
            if (start_date && end_date) {
                const dayjs = require('dayjs');
                doc.fontSize(12).fillColor('#000')
                .text(`Report Period: ${dayjs(start_date).format('MMMM D, YYYY')} - ${dayjs(end_date).format('MMMM D, YYYY')}`, { align: 'center' });
                doc.moveDown(2);
            }

            // --- content ---
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

            // --- footer ---
            doc.moveDown(2);
            doc.fontSize(10).fillColor('#777')
            .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(0.2);
            doc.fontSize(8).fillColor('#777')
            .text(`Copyright © 2025-2026 Cordova Public College. All rights reserved.`, { align: 'right' });

            doc.end();
        } catch (err) {
            console.error('❌ Error generating PDF:', err);
            res.status(500).json({ error: 'failed to generate pdf' });
        }
    }
};

module.exports = transactionLogs;