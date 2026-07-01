# Task: Fix 'Get Started' Button on Landing Page

## Problem Description

The "Get Started" button in the `HeroSection` of the landing page was previously configured to scroll to an element with `id="onboarding"`. However, no such element exists, causing the button to be unresponsive.

## Solution Implemented

1. Passed the `setOnboardingModalOpen` state setter from `LandingPage` (`page.js`) to `HeroSection`.
2. Updated the `HeroSection`'s "Get Started Now" button `onClick` handler to properly trigger the `OnboardingModal`.
3. Verified the end-to-end connection:
   - The button now opens the `<OnboardingModal>` which collects lead data.
   - The form submits data via `onboardingApi.apply()`.
   - The backend `/api/onboarding/apply` endpoint handles the request, storing the application in the `onboarding_applications` table.
   - The CRM board tracks the application, allowing Platform Owners to review and approve the request, thereby completing the B2B enterprise onboarding workflow.
