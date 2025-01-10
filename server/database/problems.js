
module.exports = [
  {
    title: "Reverse a Linked List",
    description: "Write a function to reverse a singly linked list.",
    input: "The head node of a singly linked list.",
    output: "The head node of the reversed linked list.",
    testCases: [
      {
        input: "1 -> 2 -> 3 -> 4 -> 5 -> NULL",
        output: "5 -> 4 -> 3 -> 2 -> 1 -> NULL"
      },
      {
        input: "1 -> NULL",
        output: "1 -> NULL"
      },
      {
        input: "NULL",
        output: "NULL"
      }
    ]
  },
  {
    title: "Implement a Stack",
    description: "Implement a Stack data structure with the following operations: push, pop, peek, and isEmpty.",
    input: "Various method calls with appropriate arguments.",
    output: "The result of the method call or the updated stack.",
    testCases: [
      {
        operations: ["push 1", "push 2", "push 3"],
        output: "[3, 2, 1]"
      },
      {
        operations: ["pop", "pop", "pop"],
        input: "[3, 2, 1]",
        output: "3, 2, 1"
      },
      {
        operation: "peek",
        input: "[2, 1]",
        output: "2"
      },
      {
        operation: "isEmpty",
        input: "[]",
        output: "true"
      },
      {
        operation: "isEmpty",
        input: "[1]",
        output: "false"
      }
    ]
  },
  {
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    input: "The root node of a binary tree.",
    output: "A list of lists, where each sublist represents the values of nodes at the same level.",
    testCases: [
      {
        input: "[3, 9, 20, null, null, 15, 7]",
        output: "[[3], [9, 20], [15, 7]]"
      },
      {
        input: "[1]",
        output: "[[1]]"
      },
      {
        input: "[]",
        output: "[]"
      }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing parentheses ((), {}, []), determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    input: "A string containing parentheses.",
    output: "true if the string is valid, false otherwise.",
    testCases: [
      {
        input: "()",
        output: "true"
      },
      {
        input: "()[]{}",
        output: "true"
      },
      {
        input: "(]",
        output: "false"
      },
      {
        input: "([)]",
        output: "false"
      }
    ]
  },
  {
    title: "Implement a Queue",
    description: "Implement a Queue data structure with the following operations: enqueue, dequeue, front, rear, and isEmpty.",
    input: "Various method calls with appropriate arguments.",
    output: "The result of the method call or the updated queue.",
    testCases: [
      {
        operations: ["enqueue 1", "enqueue 2", "enqueue 3"],
        output: "[1, 2, 3]"
      },
      {
        operation: "dequeue",
        input: "[1, 2, 3]",
        output: "1, [2, 3]"
      },
      {
        operation: "front",
        input: "[2, 3]",
        output: "2"
      },
      {
        operation: "rear",
        input: "[2, 3]",
        output: "3"
      },
      {
        operation: "isEmpty",
        input: "[]",
        output: "true"
      },
      {
        operation: "isEmpty",
        input: "[1]",
        output: "false"
      }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
    input: "The head nodes of two sorted linked lists.",
    output: "The head node of the merged sorted linked list.",
    testCases: [
      {
        input: "1 -> 2 -> 4, 1 -> 3 -> 4",
        output: "1 -> 1 -> 2 -> 3 -> 4 -> 4"
      },
      {
        input: "NULL, NULL",
        output: "NULL"
      },
      {
        input: "1 -> 3 -> 5, 2 -> 4 -> 6",
        output: "1 -> 2 -> 3 -> 4 -> 5 -> 6"
      }
    ]
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    input: "The root node of a binary tree.",
    output: "A list containing the values of nodes in inorder traversal.",
    testCases: [
      {
        input: "[1, null, 2, 3]",
        output: "[1, 3, 2]"
      },
      {
        input: "[]",
        output: "[]"
      },
      {
        input: "[1]",
        output: "[1]"
      }
    ]
  },
  {
    title: "Implement a Circular Queue",
    description: "Implement a Circular Queue data structure with the following operations: enqueue, dequeue, front, rear, isEmpty, and isFull.",
    input: "Various method calls with appropriate arguments.",
    output: "The result of the method call or the updated circular queue.",
    testCases: [
      {
        operations: ["enqueue 1", "enqueue 2", "enqueue 3"],
        output: "[1, 2, 3]",
        size: 3
      },
      {
        operation: "dequeue",
        input: "[1, 2, 3]",
        output: "1, [2, 3]"
      },
      {
        operation: "front",
        input: "[2, 3]",
        output: "2"
      },
      {
        operation: "rear",
        input: "[2, 3]",
        output: "3"
      },
      {
        operation: "isEmpty",
        input: "[]",
        output: "true"
      },
      {
        operation: "isFull",
        input: "[1, 2, 3]",
        output: "true",
        size: 3
      },
      {
        operation: "isFull",
        input: "[1, 2]",
        output: "false",
        size: 3
      }
    ]
  },
  {
    title: "Find the Intersection of Two Linked Lists",
    description: "Given the heads of two singly linked lists headA and headB, return the node at which the two lists intersect. If the two linked lists have no intersection, return null.",
    input: "The head nodes of two linked lists.",
    output: "The intersecting node, or null if there is no intersection.",
    testCases: [
      {
        input: "[4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5]",
        output: "[8, 4, 5]"
      },
      {
        input: "[1, 9, 1, 2, 4], [3, 2, 4]",
        output: "[2, 4]"
        },
        {
        input: "[2, 6, 4], [1, 5]",
        output: "null"
        }
        ]
        },
        {
        title: "Implement a Deque (Double-Ended Queue)",
        description: "Implement a Deque (Double-Ended Queue) data structure with the following operations: addFront, addRear, removeFront, removeRear, peekFront, peekRear, isEmpty, and isFull.",
        input: "Various method calls with appropriate arguments.",
        output: "The result of the method call or the updated deque.",
        testCases: [
        {
        operations: ["addFront 1", "addRear 2", "addFront 3"],
        output: "[3, 1, 2]"
        },
        {
        operation: "removeFront",
        input: "[3, 1, 2]",
        output: "3, [1, 2]"
        },
        {
        operation: "removeRear",
        input: "[1, 2]",
        output: "2, [1]"
        },
        {
        operation: "peekFront",
        input: "[1]",
        output: "1"
        },
        {
        operation: "peekRear",
        input: "[1]",
        output: "1"
        },
        {
        operation: "isEmpty",
        input: "[]",
        output: "true"
        },
        {
        operation: "isEmpty",
        input: "[1]",
        output: "false"
        },
        {
        operation: "isFull",
        input: "[1, 2, 3]",
        output: "true",
        size: 3
        },
        {
        operation: "isFull",
        input: "[1, 2]",
        output: "false",
        size: 3
        }
        ]
        }
        ]
        
        
        