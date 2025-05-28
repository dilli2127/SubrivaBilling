import React, { memo } from "react";

interface TermsAndConditionsProps {
  // Define any props here if needed
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Terms and Conditions</h1>
      <ul>
        <li>
          <strong>Electronic Record:</strong> This document is an electronic
          record under the Information Technology Act, 2000, and does not
          require physical or digital signatures.
        </li>
        <li>
          <strong>Publication:</strong> It's published as per Rule 3(1) of the
          Information Technology (Intermediaries guidelines) Rules, 2011,
          concerning rules, privacy policy, and Terms of Use for
          freshfocuzstudio.com.
        </li>
        <li>
          <strong>Platform Ownership:</strong> The Platform (freshfocuzstudio.com) is owned by K Dillibabu, a company
          incorporated under the Companies Act, 1956, with its registered office
          at kg kandigai.
        </li>
        <li>
          <strong>Terms of Use:</strong> Your use of the Platform and services
          is governed by these Terms of Use, including applicable policies
          incorporated by reference.
        </li>
        <li>
          <strong>Binding Agreement:</strong> By using the Platform, you enter a
          binding agreement with the Platform Owner, governed by these Terms of
          Use.
        </li>
        <li>
          <strong>Rejection of Additional Terms:</strong> Any terms proposed by
          you that conflict with these Terms of Use are expressly rejected.
        </li>
        <li>
          <strong>Modification of Terms:</strong> These Terms of Use can be
          modified at any time without notice. It's your responsibility to
          review them periodically.
        </li>
        <li>
          <strong>User Definition:</strong> "You," "your," or "user" refers to
          any person who agrees to become a user/buyer on the Platform.
        </li>
        <li>
          <strong>Agreement to Terms:</strong> Accessing, browsing, or using the
          Platform indicates your agreement to all Terms of Use.
        </li>
        <li>
          <strong>Accurate Information:</strong> You agree to provide true,
          accurate, and complete information during and after registration and
          are responsible for all actions on your account.
        </li>
        <li>
          <strong>No Warranty:</strong> The Platform and third parties provide
          no warranty regarding the accuracy, timeliness, performance,
          completeness, or suitability of information.
        </li>
        <li>
          <strong>Risk and Discretion:</strong> Your use of the Platform and
          Services is at your own risk and discretion.
        </li>
        <li>
          <strong>Proprietary Content:</strong> The Platform's content is
          proprietary and licensed to the Platform Owner. You have no
          intellectual property rights in it.
        </li>
        <li>
          <strong>Unauthorized Use:</strong> Unauthorized use of the Platform
          may lead to legal action.
        </li>
        <li>
          <strong>Payment of Charges:</strong> You agree to pay charges for
          availing the Services.
        </li>
        <li>
          <strong>Lawful Use:</strong> You agree not to use the Platform for
          unlawful or prohibited purposes.
        </li>
        <li>
          <strong>Third-Party Links:</strong> The Platform may contain links to
          third-party websites, governed by their own terms and policies.
        </li>
        <li>
          <strong>Legally Binding Contract:</strong> Initiating a transaction
          for Services creates a legally binding contract with the Platform
          Owner.
        </li>
        <li>
          <strong>Indemnification:</strong> You agree to indemnify the Platform
          Owner from any claims or demands arising from your breach of Terms,
          policies, or violation of laws.
        </li>
        <li>
          <strong>Limitation of Liability:</strong> The Platform Owner is not
          liable for indirect, consequential, incidental, special, or punitive
          damages.
        </li>
        <li>
          <strong>Liability Cap:</strong> Platform owner's liability is capped
          to the amount paid by the user for the service or Rs. 100, whichever
          is less.
        </li>
        <li>
          <strong>Force Majeure:</strong> Neither party is liable for failure to
          perform obligations due to force majeure events.
        </li>
        <li>
          <strong>Governing Law:</strong> These Terms are governed by and
          construed in accordance with the laws of India.
        </li>
        <li>
          <strong>Jurisdiction:</strong> Disputes are subject to the exclusive
          jurisdiction of courts in (Tiruthani,Tamil Nadu).
        </li>
        <li>
          <strong>Contact Information:</strong> Concerns or communications
          regarding these Terms should be made through the contact information
          provided on the website.
        </li>
      </ul>
    </div>
  );
};

export default memo(TermsAndConditions);
