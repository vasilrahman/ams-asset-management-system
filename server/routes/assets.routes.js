const express = require('express');
const { Asset, VerificationLog, Complaint } = require('../database');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all assets
router.get('/', authenticateToken, async (req, res) => {
    try {
        const assets = await Asset.findAll({
            order: [['createdAt', 'DESC']],
            include: [VerificationLog, Complaint]
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
});

// Create asset
router.post('/', authenticateToken, async (req, res) => {
    try {
        const newAsset = await Asset.create(req.body);
        res.status(201).json(newAsset);
    } catch (error) {
        res.status(500).json({ message: 'Error creating asset', error: error.message });
    }
});

// Update asset
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const [updated] = await Asset.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedAsset = await Asset.findByPk(req.params.id);
            res.json(updatedAsset);
        } else {
            res.status(404).json({ message: 'Asset not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating asset', error: error.message });
    }
});

// Delete asset
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await Asset.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Asset deleted' });
        } else {
            res.status(404).json({ message: 'Asset not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting asset', error: error.message });
    }
});

// Verify Asset
router.post('/:id/verify', authenticateToken, async (req, res) => {
    const { verifierName } = req.body;
    const assetId = req.params.id;
    const timestamp = new Date();

    try {
        // Update asset
        await Asset.update(
            { lastVerifiedDate: timestamp, verifiedBy: verifierName },
            { where: { id: assetId } }
        );

        // Create log
        const asset = await Asset.findByPk(assetId);
        const log = await VerificationLog.create({
            id: `log-${Date.now()}`,
            assetId,
            assetName: asset.name,
            verifiedBy: verifierName,
            timestamp
        });

        res.json({ message: 'Asset verified', log });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying asset', error: error.message });
    }
});

// Report Complaint
router.post('/:id/complaint', authenticateToken, async (req, res) => {
    const assetId = req.params.id;
    const { description, reportedBy, date, status } = req.body;

    try {
        const complaint = await Complaint.create({
            id: `c-${Date.now()}`,
            assetId,
            assetName: req.body.assetName,
            reportedBy,
            date,
            description,
            status: status || 'Pending'
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Error reporting complaint', error: error.message });
    }
});

module.exports = router;
