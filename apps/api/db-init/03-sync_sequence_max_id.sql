SELECT setval('"Donation_id_donation_seq"', (SELECT MAX(id_donation) FROM "Donation"));
SELECT setval('"Activity_id_activity_seq"', (SELECT MAX(id_activity) FROM "Activity"));