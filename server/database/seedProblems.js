const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { DBConnection } = require('./db');

const sampleProblems = [
    {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        acceptanceRate: 75,
        submissions: 100,
        example: `Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
        testCases: [
            {
                input: "[2,7,11,15]\n9",
                output: "[0,1]",
                operations: ["array", "target"],
                size: 4
            }
        ]
    },
    {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
        difficulty: "Medium",
        acceptanceRate: 65,
        submissions: 80,
        example: `Example 1:
Input: s = "()[]{}"
Output: true
Example 2:
Input: s = "(]"
Output: false`,
        testCases: [
            {
                input: "()[]{}",
                output: "true",
                operations: ["string"],
                size: 6
            }
        ]
    },
    {
        title: "Merge K Sorted Lists",
        description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        difficulty: "Hard",
        acceptanceRate: 45,
        submissions: 50,
        example: `Example 1:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6`,
        testCases: [
            {
                input: "[[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]",
                operations: ["array"],
                size: 8
            }
        ]
    },
    {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
        difficulty: "Easy",
        acceptanceRate: 80,
        submissions: 120,
        example: `Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.`,
        testCases: [
            {
                input: "121",
                output: "true",
                operations: ["number"],
                size: 1
            }
        ]
    },
    {
        title: "Container With Most Water",
        description: "Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
        difficulty: "Medium",
        acceptanceRate: 55,
        submissions: 90,
        example: `Example 1:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.`,
        testCases: [
            {
                input: "[1,8,6,2,5,4,8,3,7]",
                output: "49",
                operations: ["array"],
                size: 9
            }
        ]
    },
    {
        title: "Regular Expression Matching",
        description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
        difficulty: "Hard",
        acceptanceRate: 35,
        submissions: 40,
        example: `Example 1:
Input: s = "aa", p = "a*"
Output: true
Explanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".`,
        testCases: [
            {
                input: "aa\na*",
                output: "true",
                operations: ["string", "pattern"],
                size: 2
            }
        ]
    },
    {
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        difficulty: "Medium",
        acceptanceRate: 70,
        submissions: 95,
        example: `Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`,
        testCases: [
            {
                input: "[-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                operations: ["array"],
                size: 9
            }
        ]
    },
    {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        acceptanceRate: 85,
        submissions: 110,
        example: `Example 1:
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top:
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step`,
        testCases: [
            {
                input: "3",
                output: "3",
                operations: ["number"],
                size: 1
            }
        ]
    },
    {
        title: "Word Search",
        description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring.",
        difficulty: "Medium",
        acceptanceRate: 50,
        submissions: 75,
        example: `Example 1:
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true`,
        testCases: [
            {
                input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED',
                output: "true",
                operations: ["grid", "string"],
                size: 12
            }
        ]
    },
    {
        title: "Median of Two Sorted Arrays",
        description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
        difficulty: "Hard",
        acceptanceRate: 40,
        submissions: 60,
        example: `Example 1:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.0
Explanation: merged array = [1,2,3] and median is 2.0`,
        testCases: [
            {
                input: "[1,3]\n[2]",
                output: "2.0",
                operations: ["array", "array"],
                size: 3
            }
        ]
    }
];

async function seedProblems() {
    try {
        await DBConnection();
        console.log('Connected to MongoDB');

        // Clear existing problems
        await Problem.deleteMany({});
        console.log('Cleared existing problems');

        // Insert new problems
        const result = await Problem.insertMany(sampleProblems);
        console.log(`Inserted ${result.length} problems`);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedProblems();
