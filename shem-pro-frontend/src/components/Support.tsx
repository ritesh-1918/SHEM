import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const Support: React.FC = () => {
    return (
        <div className="bg-white min-h-screen font-sans text-gray-900 relative">
            <Link to="/" className="fixed top-24 left-4 lg:left-8 z-40 hidden xl:flex items-center gap-2 text-gray-500 hover:text-primary transition-colors bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100 group">
                <ArrowRightIcon className="h-4 w-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
            </Link>
            <Header />

            <div className="pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-primary mb-4">Support & Contact</h1>
                    <p className="text-xl text-gray-600">We are here to help you optimizing your energy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                        <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Email Us</h3>
                                <p className="text-gray-600">shemcontact1918@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <PhoneIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Call Us</h3>
                                <p className="text-gray-600">8464931322</p>
                                <p className="text-gray-500 text-sm">Mon - Fri, 9am - 6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <MapPinIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Visit Us</h3>
                                <p className="text-gray-600">65-3-508/A, Ex Service Men Colony, Gajuwaka</p>
                                <p className="text-gray-600">Visakhapatnam, Andhra Pradesh 530011</p>
                                {/* Map Placeholder */}
                                <div className="mt-4 w-full h-48 bg-gray-200 rounded-lg overflow-hidden relative">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m13!1m11!1m3!1d522.2121545494595!2d83.23090270994129!3d17.68509606164326!2m2!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1765820004677!5m2!1sen!2sin"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Map"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form / Google Form Embed */}
                    <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[85vh] flex flex-col">
                        <div className="bg-gray-100 p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Support Request Form</h2>
                            <p className="text-sm text-gray-500">Fill out the details below and we'll get back to you.</p>
                        </div>
                        <iframe
                            title="Support Form"
                            src="https://docs.google.com/forms/d/e/1FAIpQLSd2Xf9gV8ZKz9eEMg1-cGUCGiNPe9weNVdVinpOAjMR7egzKg/viewform?embedded=true"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            className="flex-grow w-full"
                        >
                            Loading form...
                        </iframe>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Support;
