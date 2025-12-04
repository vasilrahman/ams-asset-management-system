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
        console.log(`[API] Fetched ${assets.length} assets`); // DEBUG LOG
        if (assets.length > 0) {
            console.log('[API] Sample Asset Logs:', JSON.stringify(assets[0].VerificationLogs, null, 2)); // DEBUG LOG
        }
        res.json(assets);
    } catch (error) {
        console.error('[API] Error fetching assets:', error); // DEBUG LOG
        res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
});

// Create asset
router.post('/', authenticateToken, async (req, res) => {
    try {
        const newAsset = await Asset.create(req.body);
        // Fetch with associations to keep frontend state consistent
        const assetWithAssociations = await Asset.findByPk(newAsset.id, {
            include: [VerificationLog, Complaint]
        });
        res.status(201).json(assetWithAssociations);
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
            const updatedAsset = await Asset.findByPk(req.params.id, {
                include: [VerificationLog, Complaint]
            });
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
        // 1. Create log first
        const assetForName = await Asset.findByPk(assetId);
        const log = await VerificationLog.create({
            id: `log-${Date.now()}`,
            assetId,
            assetName: assetForName.name,
            verifiedBy: verifierName,
            timestamp
        });

        // 2. Update asset details
        await Asset.update(
            { lastVerifiedDate: timestamp, verifiedBy: verifierName },
            { where: { id: assetId } }
        );

        // 3. Fetch complete updated asset with associations
        const updatedAsset = await Asset.findByPk(assetId, {
            include: [VerificationLog, Complaint]
        });

        res.json({ message: 'Asset verified', log, asset: updatedAsset });
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
