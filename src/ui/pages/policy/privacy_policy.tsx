import React, { memo } from "react";

interface PrivacyPolicyProps {
  // Define any props here if needed
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Privacy Policy</h1>
      <ul>
        <li>
          <strong>Introduction:</strong>
          <ul>
            <li>
              This Privacy Policy describes how freshfocuzstudio collects, uses,
              shares, protects, or otherwise processes your personal data
              through its Platform.
            </li>
            <li>You can browse certain sections without registering.</li>
            <li>
              Services are offered within India, and data is primarily stored
              and processed in India.
            </li>
            <li>
              By using the Platform, you agree to this Privacy Policy, Terms of
              Use, and applicable terms, governed by Indian laws.
            </li>
            <li>If you disagree, do not use the Platform.</li>
          </ul>
        </li>
        <li>
          <strong>Collection:</strong>
          <ul>
            <li>
              Personal data is collected when you use the Platform, services, or
              interact with us.
            </li>
            <li>
              Information collected includes name, date of birth, address, phone
              number, email, and identity/address proof.
            </li>
            <li>
              Sensitive data like bank details, payment information, or
              biometric data is collected with consent.
            </li>
            <li>
              You can choose not to provide information by not using certain
              services/features.
            </li>
            <li>
              We track behavior, preferences, and provided information on the
              Platform.
            </li>
            <li>
              Transaction information on Platform and third-party partner
              platforms is collected.
            </li>
            <li>Third-party partners have their own privacy policies.</li>
            <li>
              Never provide personal data like PINs or passwords in response to
              unsolicited requests. Report suspicious activity.
            </li>
          </ul>
        </li>
        <li>
          <strong>Usage:</strong>
          <ul>
            <li>Personal data is used to provide requested services.</li>
            <li>You can opt-out of marketing uses.</li>
            <li>
              Data is used to assist sellers, enhance customer experience,
              resolve disputes, troubleshoot, inform about offers, customize
              experience, detect fraud, enforce terms, conduct research, and as
              described at data collection.
            </li>
            <li>
              Access to services may be affected if information is not provided.
            </li>
          </ul>
        </li>
        <li>
          <strong>Sharing:</strong>
          <ul>
            <li>
              Personal data may be shared within group entities and affiliates
              for service provision and marketing (opt-out available).
            </li>
            <li>
              Data may be disclosed to third parties like sellers, partners,
              service providers, logistics, payment processors, and reward
              programs.
            </li>
            <li>
              Disclosures are for service provision, legal compliance,
              enforcement, marketing, and fraud prevention.
            </li>
            <li>
              Personal and sensitive data may be disclosed to government or law
              enforcement agencies as required by law.
            </li>
            <li>
              Data may be disclosed to enforce terms, respond to claims, or
              protect rights/safety.
            </li>
          </ul>
        </li>
        <li>
          <strong>Security Precautions:</strong>
          <ul>
            <li>
              Reasonable security practices are used to protect personal data
              from unauthorized access, loss, or misuse.
            </li>
            <li>
              Security guidelines are followed when accessing account
              information.
            </li>
            <li>
              Internet transmission is not completely secure; users accept
              inherent risks.
            </li>
            <li>
              Users are responsible for protecting login and password records.
            </li>
          </ul>
        </li>
        <li>
          <strong>Data Deletion and Retention:</strong>
          <ul>
            <li>
              You can delete your account via profile settings (results in loss
              of account information).
            </li>
            <li>Contact us for assistance with deletion.</li>
            <li>
              Account deletion may be delayed for pending grievances, claims,
              shipments, or other services.
            </li>
            <li>Access is lost upon account deletion.</li>
            <li>
              Data is retained as long as necessary or as required by law.
            </li>
            <li>
              Data may be retained to prevent fraud, abuse, or for legitimate
              purposes.
            </li>
            <li>Anonymized data may be retained for analytics and research.</li>
          </ul>
        </li>
        <li>
          <strong>Your Rights:</strong>
          <ul>
            <li>
              You can access, rectify, and update personal data through Platform
              functionalities.
            </li>
          </ul>
        </li>
        <li>
          <strong>Consent:</strong>
          <ul>
            <li>
              By using the Platform or providing information, you consent to
              data collection, use, storage, disclosure, and processing.
            </li>
            <li>
              If you provide data about others, you confirm you have authority
              to do so.
            </li>
            <li>
              You consent to contact via SMS, messaging apps, call, or email for
              specified purposes.
            </li>
            <li>
              You can withdraw consent by writing to the Grievance Officer
              (mention "Withdrawal of consent").
            </li>
            <li>
              Withdrawal is not retrospective and follows Terms of Use, Privacy
              Policy, and laws.
            </li>
            <li>
              We may restrict services if consent is withdrawn for necessary
              information.
            </li>
          </ul>
        </li>
        <li>
          <strong>Changes to this Privacy Policy:</strong>
          <ul>
            <li>Check the Privacy Policy periodically for changes.</li>
            <li>
              We may update the policy to reflect changes in information
              practices.
            </li>
            <li>Significant changes may be notified as required by law.</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default memo(PrivacyPolicy);
