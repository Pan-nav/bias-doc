# Prototype 2: Authentication System

## Introduction

Prototype 2 adds a simple login and sign-up flow so users can have an account before using the bias detection features later. I chose to build a single page that handles both login and sign-up: if the email is not in storage we ask “Create new account?” and create it on confirmation; if the email exists we check the password and either log the user in or show “Invalid password”. This keeps one form and one URL (`/login`) and avoids maintaining two separate pages. User data is stored in the browser’s localStorage as a JSON array so we don’t need a server for the coursework. Passwords are stored in plain text for this prototype only; a real system would use hashing and a proper backend.

---

## Authentication Page

**Authentication Page:**  
The login page is implemented in `src/routes/login/+page.svelte`. It shows a centred card on the main-gradient background (cyan to black from the Tailwind config). The card uses a black background (`#000000`) and 15px rounded corners to match the design. The page reuses the navbar from the root layout and the PrimaryButton component for the “Login/Sign up” button so styling is consistent with the landing page.

**Screenshot 1: `src/routes/login/+page.svelte` (lines 1–30)** – Full login page in the browser (centred card, gradient background, email and password fields, button, and helper text).  
I used a single route for both login and sign-up so the user only ever sees one form. The button label “Login/Sign up” reflects that: we decide whether to log in or create an account after they submit, based on whether the email already exists in storage.

---

## Form Structure

**Form Structure:**  
The form contains two inputs (Email Address and Password), each with a label above. Spacing between form elements is 16px (`gap-4`). The submit button is the gradient PrimaryButton with the label “Login/Sign up”. Below the button is the line: “Account will be created if it doesn’t already exist.” The card has a max-width of 450px on desktop and full width with padding on smaller screens.

**Screenshot 2: `src/routes/login/+page.svelte` (lines 55–95)** – Form markup (email input, password input, PrimaryButton, helper text).  
Labels use “Email Address” and “Password” so it’s clear what to enter. The helper text explains that we create an account automatically when the email is new, which matches the “login or sign up in one step” behaviour.

---

## Email Validation

**Email Validation:**  
Email validation lives in `src/lib/utils/validation.ts` in the `validateEmail` function. The rules are: (1) not empty, (2) must contain `@`, (3) must have a domain (something after `@` with at least one dot, e.g. `.com`). I kept these in a separate file so the same rules can be reused and the page component stays readable. The page uses `$derived(validateEmail(userEmail))` so the result updates as the user types. If the email is invalid we show a red border on the input and one error message below: “Please enter a valid email address.”

**Screenshot 3: `src/lib/utils/validation.ts` (lines 14–28)** – `validateEmail` function and comments.  
**Screenshot 4: Login page** – Email field with an invalid value (e.g. “test”) and the red error message visible below.  
We use a single error string for email so the UI stays simple. The comments in the code explain why each rule exists (e.g. we need an identifier to look up or create the account).

---

## Password Validation

**Password Validation:**  
Password validation is in the same file, in `validatePassword`. The rules are: (1) at least 8 characters, (2) at least one uppercase letter, (3) at least one number. The function returns `{ valid, errors }` where `errors` is an array so we can show each failed rule. On the page we use `$derived(validatePassword(userPassword))` and render each error as a bullet below the field. Invalid fields get a red border.

**Screenshot 5: `src/lib/utils/validation.ts` (lines 36–50)** – `validatePassword` function and comments.  
**Screenshot 6: Login page** – Password field with a weak value (e.g. “abc”) and the list of password errors shown in red.  
I chose to show all password errors at once so the user can fix them in one go. The comments in the code explain the security rationale (e.g. minimum length and mixed character types).

---

## Password Toggle

**Password Toggle:**  
The password field has a show/hide toggle (eye icon) on the right inside the input. Clicking it switches the input type between `password` and `text` and swaps the icon between “eye open” and “eye closed”. This lets users check for typos without leaving the page. The button is `type="button"` so it doesn’t submit the form, and it has an `aria-label` for accessibility.

**Screenshot 7: `src/routes/login/+page.svelte` (lines 75–100)** – Password input with the eye icon button and the conditional `type` binding.  
**Screenshot 8: Login page** – Password visible (eye-open state) with text shown in the field.  
I used inline SVGs for the icons so we don’t depend on an icon library and the markup stays self-contained.

---

## User Storage Implementation

**User Storage Implementation:**  
Users are stored in localStorage under the key `biasdoc_users` as a JSON array of objects `{ email, password }`. The logic is in `src/lib/stores/auth.ts`. Functions `getUsers()` and `saveUsers()` read and write that array. We use `email.trim().toLowerCase()` when saving and when looking up so “User@Test.com” and “user@test.com” are treated as the same. No encryption or hashing is used; this is for coursework only and is documented in comments (e.g. “TODO: Add password hashing in production”).

**Screenshot 9: `src/lib/stores/auth.ts` (lines 1–45)** – Store file showing `STORAGE_KEY`, `getUsers`, `saveUsers`, and the comment about plain storage.  
**Screenshot 10: Browser DevTools** – Application → Local Storage → key `biasdoc_users` with a JSON array of one or more users.  
I chose localStorage so the app works without a server and so we can inspect data easily during testing. A real system would use a backend database and hashed passwords.

---

## Authentication Logic

**Authentication Logic:**  
On submit we first check `userExists(email)`. If the email is **not** in storage we set `showCreateConfirm = true`, which opens a modal saying “Account doesn’t exist. Create new account?” with Yes and No. If the user clicks Yes we call `createAccount(email, password)` (which appends to the list and sets `currentUser`), then `goto('/dashboard')`. If they click No we close the modal and do nothing. If the email **is** in storage we call `login(email, password)`. If it returns `success: true` we redirect to `/dashboard`. If not we set `passwordError` to the returned error (e.g. “Invalid password”) and show it in red below the password field.

**Screenshot 11: `src/routes/login/+page.svelte` (lines 35–60)** – `handleSubmit`, `confirmCreateAccount`, and `cancelCreateAccount`.  
**Screenshot 12: Login page** – Modal visible with “Account doesn’t exist. Create new account?” and Yes/No buttons (after submitting a new email).  
**Screenshot 13: Login page** – “Invalid password” message below the password field after submitting an existing email with the wrong password.  
The flow is kept linear (check email → then either confirm sign-up or check password) so it’s easy to follow and test.

---

## Reusing Components

**Reusing Components:**  
The “Login/Sign up” button is the same PrimaryButton used on the landing page. We import it and use `<PrimaryButton type="submit" label="Login/Sign up" disabled={!isFormValid} />`. We don’t pass `href`, so it renders as a `<button type="submit">`. The `disabled` prop is tied to `isFormValid` (email and password both valid and not submitting) so the user can’t submit until the form is valid.

**Screenshot 14: `src/routes/login/+page.svelte`** – Line where PrimaryButton is used with `type="submit"` and `disabled={!isFormValid}`.  
**Screenshot 15: `src/lib/components/PrimaryButton.svelte`** – Component definition showing gradient styling and optional `disabled` prop.  
Reusing PrimaryButton keeps the look consistent and avoids duplicating the gradient and border-radius styling.

---

## Tests

### Test (1): Login Page Renders
- **Input:** Open `/login` in the browser.
- **Expected:** Full page with gradient background, centred black card, “Login” heading, “Enter your details to continue”, email and password fields, “Login/Sign up” button, and “Account will be created if it doesn’t already exist.”
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

**Screenshot 9 (for Test 1):** Full login page (same as Screenshot 1).

---

### Test (2): Email – Empty
- **Input:** Leave email empty, enter a valid password, click “Login/Sign up”.
- **Expected:** Button disabled (email invalid). If validation runs on blur/change, error “Please enter a valid email address” below email.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (3): Email – No @
- **Input:** Email “test.example.com”, valid password.
- **Expected:** Email error “Please enter a valid email address”, button disabled or error shown on submit.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (4): Email – No domain
- **Input:** Email “user@”, valid password.
- **Expected:** Email error “Please enter a valid email address”.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (5): Email – Valid
- **Input:** Email “user@test.com”, valid password.
- **Expected:** No email error, form can be submitted (if password valid).
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (6): Password – Fewer than 8 characters
- **Input:** Password “Ab1” (or similar).
- **Expected:** Error “Password must be at least 8 characters” (and any other failed rules).
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (7): Password – No uppercase
- **Input:** Password “password1” (8+ chars, number, no uppercase).
- **Expected:** Error “Password must contain at least one uppercase letter”.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (8): Password – No number
- **Input:** Password “Password” (8+ chars, uppercase, no number).
- **Expected:** Error “Password must contain at least one number”.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (9): Password – Valid
- **Input:** Password “Password1” (8+ chars, one uppercase, one number).
- **Expected:** No password errors, form can be submitted (if email valid).
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (10): New User – Account Doesn’t Exist
- **Input:** Email “newuser@test.com”, valid password, click “Login/Sign up”.
- **Expected:** Modal appears: “Account doesn’t exist. Create new account?” with Yes and No.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (11): New User – Confirm Account Creation
- **Input:** After Test (10), click “Yes” in the modal.
- **Expected:** Account is created, user is logged in, redirect to `/dashboard`, dashboard shows “You are logged in as newuser@test.com”.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (12): Existing User – Correct Password
- **Input:** Email of an existing user (e.g. from Test 11), correct password, click “Login/Sign up”.
- **Expected:** Login success, redirect to `/dashboard`.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (13): Existing User – Wrong Password
- **Input:** Same existing email, wrong password (e.g. “WrongPass1”), click “Login/Sign up”.
- **Expected:** “Invalid password” (or similar) shown in red below the password field, no redirect.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (14): Loading State
- **Input:** Enter valid new email and password, click “Login/Sign up”, then “Yes” in the modal.
- **Expected:** Button shows “Loading...” and is disabled while redirecting (or while a future API call runs).
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

### Test (15): Responsive / Layout
- **Input:** Resize browser to a narrow width (e.g. mobile).
- **Expected:** Card remains visible, full width with padding, form still usable.
- **Actual:** [Fill after testing]
- **Status:** PASS / FAIL

---

## Iterative Improvement 1: [Problem you found]

**Problem:** [e.g. “Submit button was clickable with invalid email, causing an error.”]

**Old code:** [Screenshot or code snippet of the previous version.]

**New code:** [Screenshot or code snippet after the fix.]

**Fix:** [e.g. “Wired the button’s `disabled` prop to `isFormValid`, which is derived from email and password validation. Now the button is only clickable when both fields pass validation.”]

---

## Iterative Improvement 2: [Another issue]

**Problem:** [e.g. “New users were not asked to confirm before creating an account.”]

**Old code:** [Screenshot or code snippet.]

**New code:** [Screenshot or code snippet.]

**Fix:** [e.g. “Added a check for `userExists(email)` before creating an account. If the email is new we set `showCreateConfirm = true` and show a modal. We only call `createAccount` when the user clicks Yes.”]

---

## Screenshot Guide (file paths and line numbers)

| Screenshot | File | Lines / What to capture |
|------------|------|-------------------------|
| 1 | `src/routes/login/+page.svelte` | Full login page in browser |
| 2 | `src/routes/login/+page.svelte` | Form section (approx. lines 55–95) |
| 3 | `src/lib/utils/validation.ts` | `validateEmail` function (approx. lines 14–28) |
| 4 | Browser | Login page with invalid email and error message |
| 5 | `src/lib/utils/validation.ts` | `validatePassword` function (approx. lines 36–50) |
| 6 | Browser | Login page with invalid password and error list |
| 7 | `src/routes/login/+page.svelte` | Password input and eye icon (approx. lines 75–100) |
| 8 | Browser | Password visible (eye open) |
| 9 | `src/lib/stores/auth.ts` | Storage key and get/save logic (approx. lines 1–45) |
| 10 | Browser DevTools | Local Storage → `biasdoc_users` |
| 11 | `src/routes/login/+page.svelte` | `handleSubmit` and confirm/cancel (approx. lines 35–60) |
| 12 | Browser | “Create new account?” modal |
| 13 | Browser | “Invalid password” message |
| 14 | `src/routes/login/+page.svelte` | PrimaryButton usage |
| 15 | `src/lib/components/PrimaryButton.svelte` | Component with gradient and disabled |

---

## Deliverables Checklist

- [x] Code: `src/routes/login/+page.svelte`, `src/lib/utils/validation.ts`, `src/lib/stores/auth.ts`, `src/routes/dashboard/+page.svelte`, PrimaryButton reuse, navbar links to `/login`
- [x] Documentation: This file following the required structure
- [x] Screenshot guide: Table above with file paths and line numbers
- [x] Minimum 15 tests: Tests (1)–(15) with Input / Expected / Actual / Status
- [x] At least 2 iterative improvements: Sections with Problem / Old code / New code / Fix (templates filled after you run tests and fix issues)
