# Quick Setup Guide

## Getting Started in 5 Minutes

### Step 1: Admin Setup (First Time)

1. **Open the application**
2. **Click "Admin Panel →"** on the login page
3. **Click "Manage Questions"** button

### Step 2: Add Your First Question

1. **Click "Add New Question"**
2. **Fill in the question details:**
   - **Title**: "Write a program to implement Bubble Sort"
   - **Description**: "Write a JavaScript program to sort an array [64, 34, 25, 12, 22, 11, 90] using Bubble Sort and print the sorted result."
   - **Difficulty**: Medium
   - **Expected Output**: `[11, 12, 22, 25, 34, 64, 90]`

3. **Add 10 MCQ Questions** (scroll down in the form):
   
   **Question 1:**
   - Question: "What is the time complexity of Bubble Sort in the worst case?"
   - Options: O(n), O(n log n), O(n²), O(log n)
   - Correct Answer: Option 3 (O(n²))

   **Question 2:**
   - Question: "Is Bubble Sort a stable sorting algorithm?"
   - Options: Yes, No, Sometimes, Depends on implementation
   - Correct Answer: Option 1 (Yes)

   _(Continue adding 8 more MCQs related to your topic)_

4. **Click "Save Question"**

### Step 3: Test as Student

1. **Go back to login page** (click Back to Admin → Back to Login)
2. **Enter student credentials:**
   - Name: Test Student
   - Register Number: 2024CS001
3. **Click "Get Random Question"**
4. **Click "Start Lab Examination"**

### Step 4: Complete the Exam (Test Run)

**Programming Section:**
```javascript
// Sample solution for Bubble Sort
const arr = [64, 34, 25, 12, 22, 11, 90];

for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
}

console.log(JSON.stringify(arr));
```

Click "Run Code" - You should see the output match the expected result!

**Observation Section:**
Write observations about the algorithm, approach, and learnings.

**MCQ Section:**
Answer all 10 questions.

**Submit & Download:**
Click "Submit Exam" and then "Download Result (PDF)"

---

## Sample Question Template (Copy-Paste Ready)

### Programming Questions Ideas

1. **Bubble Sort** - Sort an array using bubble sort
2. **Binary Search** - Implement binary search algorithm
3. **Factorial** - Calculate factorial using recursion
4. **Fibonacci** - Generate Fibonacci sequence
5. **Palindrome** - Check if a string is palindrome
6. **Prime Number** - Check if a number is prime
7. **Array Reverse** - Reverse an array without using built-in methods
8. **String Reverse** - Reverse a string character by character
9. **Sum of Array** - Calculate sum of array elements
10. **Find Maximum** - Find largest element in array

### JavaScript Output Examples

Make sure students use `console.log()` to print output:

```javascript
// For arrays
console.log(JSON.stringify(arr));  // [1, 2, 3]

// For numbers
console.log(result);  // 42

// For strings
console.log(str);  // "Hello"

// For booleans
console.log(isPrime);  // true
```

---

## Tips for Admins

1. **Test Questions First**: Always test your questions as a student before the actual exam
2. **Expected Output Format**: Make sure the expected output exactly matches what console.log will produce
3. **MCQ Quality**: Write clear, unambiguous MCQ questions
4. **Difficulty Balance**: Mix easy, medium, and hard questions
5. **Regular Backups**: Export all results regularly (Admin Panel → Export All Results)

---

## Common Issues

**Q: Students can't see any questions**
A: Make sure you've created at least one question in Admin → Manage Questions

**Q: Code output doesn't match expected**
A: Check the format - arrays need `JSON.stringify()`, exact spacing matters

**Q: How to delete all data?**
A: Admin Panel → Clear All Data (Warning: This cannot be undone!)

**Q: How to add more questions?**
A: Admin Panel → Manage Questions → Add New Question

---

## Quick Reference

| Feature | Location | Action |
|---------|----------|--------|
| Add Questions | Admin Panel → Manage Questions | Click "Add New Question" |
| View Results | Admin Panel | See all submissions |
| Export Data | Admin Panel | Click "Export All Results" |
| Student Login | Main Login Page | Enter name & reg number |
| Download PDF | Result Page | Click "Download Result (PDF)" |

---

## System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Minimum 1280x720 screen resolution recommended
- Stable internet connection (for initial load)

---

Ready to go! 🚀

For detailed documentation, see [README.md](./README.md)
