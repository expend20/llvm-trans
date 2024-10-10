import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import Link from 'next/link';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">
      <main className="flex-grow container mx-auto px-4 py-4" style={{ maxWidth: '800px' }}>
      <Card className="shadow-lg m-4 w-2/3 mx-auto">
        <h2 className="text-3xl font-bold mb-4">Get in Touch 💌</h2>
        <p className="text-lg mb-4">
          We'd love to hear from you! 😊 Whether you have questions about our obfuscation services, want to provide feedback,
          propose an exciting new feature 🌟, or enquire about custom research & development 🔬, 
          please don't hesitate to reach out using the form below. We're here to innovate with you! 🚀🤗
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2">Name</label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">Email</label>
            <InputText
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block mb-2">Message</label>
            <InputTextarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full"
            />
          </div>
          <Button type="submit" label="Send Message" className="p-button-raised p-button-primary" />
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ContactForm;