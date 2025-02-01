const Solution = require('../models/Solution');
const User = require('../models/User');

// Fetch Leaderboard Data
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Solution.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSubmissions: { $sum: 1 },
                    bestTime: { $min: "$executionTime" },
                    problemsSolved: { $addToSet: "$problem" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    username: "$userDetails.username",
                    totalSubmissions: 1,
                    bestTime: 1,
                    problemsSolved: { $size: "$problemsSolved" }
                }
            },
            {
                $sort: { problemsSolved: -1, bestTime: 1 }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
