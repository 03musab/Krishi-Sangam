import { useNav } from '../context/NavContext';

export default function Terms() {
  return (
    <div style={{ paddingBottom: '60px' }}>
      <section className="section" style={{ background: 'var(--surface-2)', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-dark)' }}>Terms and Conditions</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-mid)', marginTop: '20px' }}>
          Please read these terms carefully before using Krishi Setu.
        </p>
      </section>

      <section className="section" style={{ maxWidth: '900px', margin: '40px auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '16px', color: 'var(--text-mid)', lineHeight: '1.8' }}>
          
          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>1. Acceptance of Terms</h3>
            <p>Welcome to Krishi Setu. By accessing or using our website or mobile application, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue using our platform immediately.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>2. About Krishi Setu</h3>
            <p>Krishi Setu is a digital platform that connects farmers, landowners, equipment owners, agricultural service providers, and other stakeholders within the agricultural ecosystem. We facilitate connections between users but are not a party to agreements entered into between users unless explicitly stated.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>3. User Eligibility</h3>
            <p>By using Krishi Setu, you confirm that:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>You are at least 18 years of age or legally capable of entering into contracts.</li>
              <li>The information you provide is accurate and up to date.</li>
              <li>You will use the platform only for lawful purposes.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>4. User Accounts</h3>
            <p>Users are responsible for maintaining the confidentiality of their login credentials.</p>
            <p style={{ marginTop: '10px' }}>You agree to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Provide accurate registration details.</li>
              <li>Update your information whenever necessary.</li>
              <li>Immediately notify us of any unauthorized access to your account.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>Krishi Setu reserves the right to suspend or terminate accounts found to contain false or misleading information.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>5. Platform Services</h3>
            <p>Krishi Setu currently offers services including:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Agricultural land leasing</li>
              <li>Farm equipment rentals</li>
              <li>Agricultural labour and farm services</li>
            </ul>
            <p style={{ marginTop: '10px' }}>Additional services may be introduced in the future.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>6. User Responsibilities</h3>
            <p>Users agree to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Provide truthful information.</li>
              <li>Honour commitments made through the platform.</li>
              <li>Treat other users respectfully.</li>
              <li>Comply with all applicable laws and regulations.</li>
              <li>Avoid fraudulent, misleading, or illegal activities.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>7. Payments</h3>
            <p>Where applicable:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Payments must be made using approved payment methods.</li>
              <li>Applicable service charges, taxes, and fees will be displayed before confirmation.</li>
              <li>Krishi Setu reserves the right to modify pricing with prior notice.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>8. Cancellation & Refunds</h3>
            <p>Cancellation and refund policies may vary depending on the service booked.</p>
            <p style={{ marginTop: '10px' }}>Refunds, where applicable, will be processed according to our Refund Policy.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>9. Verification</h3>
            <p>Krishi Setu may verify user identities, documents, land ownership details, equipment ownership, or business information.</p>
            <p style={{ marginTop: '10px' }}>However, verification does not constitute a guarantee of authenticity, ownership, quality, or future performance.</p>
            <p style={{ marginTop: '10px' }}>Users should exercise their own judgment before entering into any transaction.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>10. Limitation of Liability</h3>
            <p>Krishi Setu acts as a technology platform connecting users.</p>
            <p style={{ marginTop: '10px' }}>We do not guarantee:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Completion of transactions</li>
              <li>Quality of equipment or services</li>
              <li>Crop yields</li>
              <li>Land productivity</li>
              <li>Availability of labour</li>
              <li>Accuracy of information provided by users</li>
            </ul>
            <p style={{ marginTop: '10px' }}>Krishi Setu shall not be liable for any direct, indirect, incidental, consequential, or financial losses arising from the use of the platform.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>11. Intellectual Property</h3>
            <p>All content on Krishi Setu, including logos, trademarks, text, graphics, software, and design, is the intellectual property of Krishi Setu unless otherwise stated.</p>
            <p style={{ marginTop: '10px' }}>Unauthorized reproduction or distribution is prohibited.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>12. Privacy</h3>
            <p>Your use of Krishi Setu is also governed by our Privacy Policy.</p>
            <p style={{ marginTop: '10px' }}>By using the platform, you consent to the collection and processing of information as described in that policy.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>13. Prohibited Activities</h3>
            <p>Users must not:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Provide false information.</li>
              <li>Upload unlawful or offensive content.</li>
              <li>Attempt unauthorized access to our systems.</li>
              <li>Interfere with platform operations.</li>
              <li>Engage in fraudulent transactions.</li>
              <li>Misrepresent ownership of land, equipment, or services.</li>
            </ul>
            <p style={{ marginTop: '10px' }}>Violation of these terms may result in suspension or permanent termination of your account.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>14. Third-Party Services</h3>
            <p>Krishi Setu may integrate third-party payment gateways, mapping services, verification providers, or logistics partners.</p>
            <p style={{ marginTop: '10px' }}>We are not responsible for the services, policies, or actions of third-party providers.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>15. Changes to Services</h3>
            <p>Krishi Setu reserves the right to modify, suspend, discontinue, or improve any feature or service without prior notice.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>16. Changes to Terms</h3>
            <p>We may update these Terms & Conditions from time to time.</p>
            <p style={{ marginTop: '10px' }}>Continued use of the platform after changes are published constitutes acceptance of the revised Terms.</p>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>17. Governing Law</h3>
            <p>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.</p>
            <p style={{ marginTop: '10px' }}>Any disputes shall be subject to the exclusive jurisdiction of the courts located in Nanded, Maharashtra, unless otherwise required by applicable law.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
