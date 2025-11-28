import React from "react";
import PageContainer from "../components/PageContainer";
import { Mail, Phone, MapPin } from "lucide-react";
import Footer from "../components/Footer";

const ContactPage = () => {
  return (
    <PageContainer>
      <main>
        <section className="relative w-full min-h-screen flex items-start py-12">

          <div className="max-w-5xl mx-auto px-4 relative z-10 w-full">

            {/* Heading */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-white drop-shadow-xl
 mb-2 text-black drop-shadow-lg">
                Contact Us
              </h1>
              <p className="text-black text-lg max-w-xl mx-auto">
                Reach out to us anytime. We're here to assist you.
              </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full">

              {/* LEFT – FORM */}
              <form className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 
                  border border-white/30 shadow-xl 
                  flex flex-col justify-between
                  h-full">

                <div>
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Send a Message
                  </h2>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-md font-semibold text-black mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="rounded-lg p-3 bg-white/70 border border-gray-300 
                        focus:ring-4 focus:ring-indigo-400 outline-none w-full"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-md font-semibold text-black mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="rounded-lg p-3 bg-white/70 border border-gray-300 
                        focus:ring-4 focus:ring-indigo-400 outline-none w-full"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-md font-semibold text-black mb-1">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter your message"
                        className="rounded-lg p-3 bg-white/70 border border-gray-300 
                        focus:ring-4 focus:ring-indigo-400 outline-none 
                        resize-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled
                  className="mt-6 w-full py-3 text-md font-semibold rounded-lg 
                  text-white shadow-lg disabled:opacity-100 
                  bg-[#0000e6]"
                >
                  Send Message
                </button>

              </form>

              {/* RIGHT – CONTACT INFO */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 
                  border border-white/20 shadow-xl 
                  flex flex-col justify-center 
                  h-[360px]">

                <h2 className="text-2xl font-bold text-black mb-6">
                  Our Contact Info
                </h2>

                <div className="space-y-8">

                  {/* Office */}
                  <div className="flex items-center gap-4 group">
                    <div className="p-4 bg-white/20 rounded-xl shadow-md transition-colors duration-300 group-hover:bg-[#1B3C2B]">
                      <MapPin className="h-6 w-6 text-[#0000e6] transition-colors duration-300 group-hover:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Office Location</h3>
                      <p className="text-black text-sm">
                        Terravale Ventures LLP <br />
                        Idukki, Kerala, India
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-4 group">
                    <div className="p-4 bg-white/20 rounded-xl shadow-md transition-colors duration-300 group-hover:bg-[#1B3C2B]">
                      <Phone className="h-6 w-6 text-[#0000e6] transition-colors duration-300 group-hover:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Phone</h3>
                      <p className="text-black text-sm">+91 98765 43210</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4 group">
                    <div className="p-4 bg-white/20 rounded-xl shadow-md transition-colors duration-300 group-hover:bg-[#1B3C2B]">
                      <Mail className="h-6 w-6 text-[#0000e6] transition-colors duration-300 group-hover:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Email</h3>
                      <p className="text-black text-sm">support@terravale.com</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageContainer>
  );
};

export default ContactPage;
