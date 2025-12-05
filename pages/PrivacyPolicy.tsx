import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050510 0%, #0a1128 100%)',
      color: '#ffffff',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(5, 17, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#22d3ee',
          textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
        }}>
          Privacy Policy
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '32px'
        }}>
          Last Updated: December 5, 2025
        </p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            1. Introduction
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            Welcome to <strong>In Resonance Well</strong> ("we," "us," or "our"). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information in compliance with the UK Data Protection Act 2018 and the General Data Protection Regulation (GDPR).
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            2. Data Controller
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            In Resonance Well is the data controller responsible for your personal data. If you have any questions about this policy or our data practices, please contact us at:
          </p>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#22d3ee',
            marginLeft: '20px'
          }}>
            Email: <a href="mailto:support@inresonancewell.com" style={{ color: '#22d3ee', textDecoration: 'underline' }}>support@inresonancewell.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            3. What Data We Collect
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            We collect the following types of personal data:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Email Addresses:</strong> When you subscribe to our newsletter or create an account.</li>
            <li><strong>User-Uploaded Photos:</strong> When you use our "Time Corridor" feature to personalize your experience.</li>
            <li><strong>Usage Data:</strong> Analytics data collected via PostHog, including page views, interactions, and session duration (anonymized where possible).</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            4. How We Use Your Data
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            We process your personal data for the following purposes:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Newsletter Communications:</strong> To send you updates, wellness tips, and feature announcements (with your consent).</li>
            <li><strong>Time Corridor Feature:</strong> To store and display your uploaded photos within your personal healing journey.</li>
            <li><strong>Analytics & Improvement:</strong> To understand user behavior and improve our services.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            5. Legal Basis for Processing
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            We process your personal data under the following legal bases:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Consent (Article 6(1)(a) GDPR):</strong> For newsletter subscriptions and photo uploads.</li>
            <li><strong>Legitimate Interests (Article 6(1)(f) GDPR):</strong> For analytics to improve user experience.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            6. Third-Party Services
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            We use the following third-party services to process your data:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Supabase:</strong> A secure, EU-hosted database for storing email addresses and user-uploaded photos.</li>
            <li><strong>PostHog:</strong> Analytics platform for tracking user interactions (data anonymized where possible).</li>
          </ul>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: '12px'
          }}>
            These services are GDPR-compliant and process data in accordance with UK and EU data protection laws.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            7. Data Retention
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Email Addresses:</strong> Until you unsubscribe from our newsletter or request deletion.</li>
            <li><strong>User Photos:</strong> Until you delete them from your Time Corridor or close your account.</li>
            <li><strong>Analytics Data:</strong> Retained for up to 24 months for service improvement purposes.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            8. Your Rights Under GDPR
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            You have the following rights regarding your personal data:
          </p>
          <ul style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.8)',
            marginLeft: '20px',
            listStyle: 'disc'
          }}>
            <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Request corrections to inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data.</li>
            <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for newsletter subscriptions or photo uploads at any time.</li>
          </ul>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: '12px'
          }}>
            To exercise any of these rights, please contact us at <a href="mailto:support@inresonancewell.com" style={{ color: '#22d3ee', textDecoration: 'underline' }}>support@inresonancewell.com</a>.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            9. Data Security
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            10. International Data Transfers
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Your data is primarily stored within the EU via Supabase's EU hosting. Any international transfers comply with GDPR requirements, including Standard Contractual Clauses (SCCs) or adequacy decisions.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            11. Cookies and Tracking
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            We use cookies and similar tracking technologies (via PostHog) to analyze user behavior. You can manage cookie preferences through your browser settings. Disabling cookies may limit certain features of our website.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            12. Children's Privacy
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Our services are not intended for children under 16. We do not knowingly collect data from children. If you believe we have inadvertently collected data from a child, please contact us immediately.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            13. Changes to This Policy
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            14. Contact Us
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '12px'
          }}>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#22d3ee',
            marginLeft: '20px'
          }}>
            Email: <a href="mailto:support@inresonancewell.com" style={{ color: '#22d3ee', textDecoration: 'underline' }}>support@inresonancewell.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            15. Complaints
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            If you believe we have not handled your data in accordance with this policy, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'underline' }}>ico.org.uk</a>.
          </p>
        </section>

        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <a
            href="/"
            style={{
              color: '#22d3ee',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← Back to In Resonance Well
          </a>
        </div>
      </div>
    </div>
  );
};
