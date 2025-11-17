import React from 'react';
import { RiMoneyDollarBoxLine } from 'react-icons/ri';
import { RiLinkedinBoxFill, RiTwitterFill, RiGithubFill } from 'react-icons/ri';

export default function PersonalWebsite() {
  const calculators = [
    { 
      name: "Home Loan Simulator", 
      url: "home-loan-calculator.html", 
      icon: <RiMoneyDollarBoxLine className="text-2xl text-primary mr-3" /> 
    },
    { 
      name: "Random Number Eliminator", 
      url: "/random-number-eliminator", 
      icon: <RiDice6Fill className="text-2xl text-primary mr-3" /> 
    },
  ];



  const socialMedia = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/lesliexgarcia", icon: <RiLinkedinBoxFill className="w-6 h-6 text-gray-800 hover:text-blue-500 transition duration-200" /> },
    { name: "GitHub", url: "https://github.com/triforce123", icon: <RiGithubFill className="w-6 h-6 text-gray-800 hover:text-blue-500 transition duration-200" /> },
  ];


  return (
    <div className="bg-gray-100">
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans ">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 mt-8">My Calculator AI</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Hi there! I’m an analyst who loves turning data into stories and systems that make sense.
          I design tools, dashboards, and calculators that simplify complex information, helping people make smarter decisions faster.
          I’m passionate about the intersection of analytics and user experience, finding the balance between precision and clarity.
          This website is where I share the projects, experiments, and insights that come from that process. Hope you find them useful and engaging!
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Calculator Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculators.map((calc, index) => (
            <a
              key={index}
              href={calc.url}
              className="flex items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className='text-gray-800'>{calc.icon}</div>
              <h3 className="text-xl font-medium text-gray-800">{calc.name}</h3>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Connect with Me</h2>
        <div className="flex space-x-4">
          {socialMedia.map((social, index) => (
            <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
              {social.icon}
              <span className="ml-2 text-gray-800">{social.name}</span>
            </a>
          ))}
        </div>
      </footer>
    </div>
    </div>
  );
}
