import React from 'react';
import ContactForm from '../../components/ContactForm';
import { Card } from 'primereact/card';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">
      <main className="flex-grow container mx-auto px-4 py-4">
        <section className="mb-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 pr-4">
                <h2 className="text-3xl font-bold mb-4">Get in Touch 💌</h2>
                <p className="text-lg mb-4">
                  We'd love to hear from you! 😊 Whether you have questions about our obfuscation services or want to provide feedback,
                  please don't hesitate to reach out using the form below. 🤗
                </p>
              </div>
            </div>
        </section>
        <ContactForm />
      </main>
    </div>
  );
};

export default ContactPage;