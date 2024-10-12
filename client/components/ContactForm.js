import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import axios from 'axios';
import { ProgressSpinner } from 'primereact/progressspinner';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/notifier', {
        subject: 'New Contact Form Submission',
        text: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
      });

      if (response.status === 200) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Message sent successfully!', life: 3000 });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send message. Please try again.', life: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">
      <Toast ref={toast} />
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
          <div className="mb-4">
            <Button 
              type="submit" 
              label={isLoading ? 'Sending...' : 'Send Message'} 
              className="p-button-raised p-button-primary" 
              disabled={isLoading}
              icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
            />
          </div>
        </form>
        </Card>
      </main>
    </div>
  );
};

export default ContactForm;
