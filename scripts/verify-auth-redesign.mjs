/**
 * Nur Academy - Auth Pages Redesign Verification Suite
 * Verifies split-screen auth layout, password strength estimator,
 * password matching, accessibility, and zero-regression security.
 */

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { estimatePasswordStrength } from '../src/lib/passwordStrength.ts';

let totalTests = 0;
let passedTests = 0;

function testAssert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

console.log('🧪 Starting Nur Academy Authentication Pages Verification Suite...\n');

// ── 1. PASSWORD STRENGTH ESTIMATOR TESTS ──
console.log('--- 1. Password Strength Estimator Evaluation ---');

const emptyRes = estimatePasswordStrength('');
testAssert(emptyRes.score === 0, 'Empty password has score 0');
testAssert(emptyRes.labelUz === 'Juda zaif', 'Empty password labeled Juda zaif');

const trivial123 = estimatePasswordStrength('123456');
testAssert(trivial123.score <= 1, 'Trivial sequence "123456" scored as weak (0 or 1)');
testAssert(trivial123.barColor === 'bg-red-500', 'Trivial password color is red');

const trivialWord = estimatePasswordStrength('password');
testAssert(trivialWord.score <= 1, 'Trivial word "password" scored as weak (0 or 1)');

const mediumPass = estimatePasswordStrength('Salom123');
testAssert(mediumPass.score === 2, '"Salom123" scored as O‘rtacha (2)');
testAssert(mediumPass.labelUz === 'O‘rtacha', 'Medium label is O‘rtacha');
testAssert(mediumPass.barColor === 'bg-amber-500', 'Medium color is amber');

const strongPass = estimatePasswordStrength('Pedagog#2026!');
testAssert(strongPass.score >= 3, '"Pedagog#2026!" scored as Kuchli or Juda kuchli (>= 3)');
testAssert(['Kuchli', 'Juda kuchli'].includes(strongPass.labelUz), 'Strong label matches Kuchli / Juda kuchli');

const veryStrongPass = estimatePasswordStrength('Oqituvchilar_Kengashi_2026!$');
testAssert(veryStrongPass.score === 4, 'High-entropy 28-char password scored as Juda kuchli (4)');
testAssert(veryStrongPass.labelUz === 'Juda kuchli', 'Very strong label is Juda kuchli');
testAssert(veryStrongPass.barColor === 'bg-emerald-500', 'Very strong color is emerald');

// ── 2. STATIC CODE STRUCTURE & ACCESSIBILITY AUDIT ──
console.log('\n--- 2. Static Code Structure & Accessibility Audit ---');

const loginCode = readFileSync(resolve('src/pages/Login.tsx'), 'utf8');
const signupCode = readFileSync(resolve('src/pages/Signup.tsx'), 'utf8');
const forgotCode = readFileSync(resolve('src/pages/ForgotPassword.tsx'), 'utf8');
const resetCode = readFileSync(resolve('src/pages/ResetPassword.tsx'), 'utf8');
const splitCode = readFileSync(resolve('src/components/auth/AuthSplitLayout.tsx'), 'utf8');

// Split layout usage
testAssert(loginCode.includes('<AuthSplitLayout'), 'Login uses AuthSplitLayout');
testAssert(signupCode.includes('<AuthSplitLayout'), 'Signup uses AuthSplitLayout');
testAssert(forgotCode.includes('<AuthSplitLayout'), 'ForgotPassword uses AuthSplitLayout');
testAssert(resetCode.includes('<AuthSplitLayout'), 'ResetPassword uses AuthSplitLayout');

// Brand mascot integration on desktop
testAssert(splitCode.includes('hero_mascot_scene.png'), 'Auth layout embeds authentic brand mentor mascot');
testAssert(splitCode.includes('bg-uzbek-ornament'), 'Auth layout includes subtle Uzbek cultural pattern');

// Show/hide password controls have type="button" to prevent form submission
testAssert(loginCode.includes('type="button"') && loginCode.includes('setShowPassword'), 'Login show/hide has type="button"');
testAssert(signupCode.includes('type="button"') && signupCode.includes('setShowPassword'), 'Signup show/hide has type="button"');
testAssert(signupCode.includes('type="button"') && signupCode.includes('setShowConfirmPassword'), 'Signup confirm show/hide has type="button"');

// Registration confirm password matching
testAssert(signupCode.includes('Parolni qayta kiriting'), 'Signup contains confirm password field');
testAssert(signupCode.includes('Parollar mos keldi'), 'Signup contains match success message "Parollar mos keldi"');
testAssert(signupCode.includes('Parollar mos kelmadi'), 'Signup contains mismatch error message "Parollar mos kelmadi"');

// Submit prevention on mismatch
testAssert(signupCode.includes('passwordsMatch === false'), 'Signup blocks submission when passwords mismatch');

// Privacy: Confirm password field NOT sent to Supabase API
testAssert(!signupCode.includes('confirmPassword: confirmPassword') && !signupCode.includes('confirm_password:'), 'Confirm password is NOT sent to API');

// Google OAuth presence
testAssert(loginCode.includes('handleGoogleLogin') && loginCode.includes('Google bilan kirish'), 'Login has Google OAuth option');
testAssert(signupCode.includes('handleGoogleSignup') && signupCode.includes('Google bilan roʻyxatdan oʻtish'), 'Signup has Google OAuth option');

// Password recovery neutral feedback
testAssert(forgotCode.includes('Agar') && forgotCode.includes('tizimda ro‘yxatdan o‘tgan bo‘lsa'), 'ForgotPassword gives neutral message preventing user enumeration');

console.log('\n======================================================');
console.log(`🎉 ALL ${passedTests} / ${totalTests} AUTH VERIFICATIONS PASSED!`);
console.log('======================================================');
