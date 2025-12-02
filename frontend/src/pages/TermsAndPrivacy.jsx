import React from "react";
import PageContainer from "../components/PageContainer";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const TermsAndPrivacy = () => {
    return (
        <PageContainer>
            <main className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

                    <h1 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl">
                        Terms & Privacy Policy
                    </h1>

                    <div className="space-y-8 text-black">

                        {/* Terms Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                ✈️ Terms of Service
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Welcome to Terravale Ventures LLP. By accessing our platform, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You must be at least 18 years of age to use this service.</li>
                                <li>All product prices and availability are subject to change without notice.</li>
                                <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
                                <li>Your content (not including credit card information) may be transferred unencrypted.</li>
                            </ul>
                        </section>

                        {/* Privacy Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                ✈️ Privacy Policy
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Your privacy is important to us. It is Terravale Ventures LLP's policy to respect your privacy regarding any information we may collect from you across our website.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>We only ask for personal information when we truly need it to provide a service to you.</li>
                                <li>We collect it by fair and lawful means, with your knowledge and consent.</li>
                                <li>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</li>
                                <li>Our website may link to external sites that are not operated by us.</li>
                            </ul>
                        </section>

                        {/* Return Button */}
                        <div className="pt-8 text-center">
                            <Link to="/login/buyer">
                                <button className="px-8 py-3 border border-white/40 text-white text-lg rounded-md bg-white/10 hover:bg-[rgba(27,60,43,0.6)] hover:scale-105 hover:text-black transition shadow-md font-semibold cursor-pointer">
                                    Return to Login
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </PageContainer>
    );
};

export default TermsAndPrivacy;
