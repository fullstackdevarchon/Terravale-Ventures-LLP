// Font Test Component - Verify Science Gothic Implementation
// This component can be temporarily added to any page to verify the font is working

import React from 'react';

const FontTest = () => {
    return (
        <div className="p-8 space-y-8 bg-white rounded-lg shadow-lg">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">Science Gothic Font Test</h1>
                <p className="text-gray-600">Verify that Science Gothic is loaded and working correctly</p>
            </div>

            {/* Font Weights Test */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Font Weights (100-900)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-thin text-lg">Thin (100) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-thin or font-science-thin</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-extralight text-lg">Extra Light (200) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-extralight or font-science-extralight</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-light text-lg">Light (300) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-light or font-science-light</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-normal text-lg">Regular (400) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-normal or font-science-regular</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-medium text-lg">Medium (500) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-medium or font-science-medium</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-semibold text-lg">Semibold (600) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-semibold or font-science-semibold</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-bold text-lg">Bold (700) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-bold or font-science-bold</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                        <p className="font-extrabold text-lg">Extra Bold (800) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-extrabold or font-science-extrabold</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded col-span-full">
                        <p className="font-black text-lg">Black (900) - Science Gothic</p>
                        <p className="text-sm text-gray-500">font-black or font-science-black</p>
                    </div>
                </div>
            </div>

            {/* Size Test */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Font Sizes</h2>

                <div className="space-y-2">
                    <p className="text-xs">Extra Small (xs) - Science Gothic</p>
                    <p className="text-sm">Small (sm) - Science Gothic</p>
                    <p className="text-base">Base - Science Gothic</p>
                    <p className="text-lg">Large (lg) - Science Gothic</p>
                    <p className="text-xl">Extra Large (xl) - Science Gothic</p>
                    <p className="text-2xl">2XL - Science Gothic</p>
                    <p className="text-3xl">3XL - Science Gothic</p>
                    <p className="text-4xl">4XL - Science Gothic</p>
                </div>
            </div>

            {/* Real-world Examples */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Real-world Examples</h2>

                <div className="space-y-4">
                    {/* Button */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Button Example:</p>
                        <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                            Click Me - Science Gothic
                        </button>
                    </div>

                    {/* Card */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Card Example:</p>
                        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                            <h3 className="text-xl font-bold mb-2">Card Title - Science Gothic</h3>
                            <p className="text-gray-700 mb-4">
                                This is a sample card with Science Gothic font. The font should be consistent across all text elements.
                            </p>
                            <button className="px-4 py-2 bg-white text-indigo-600 font-medium rounded shadow-sm hover:shadow-md transition">
                                Action Button
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Table Example:</p>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left font-semibold">Name</th>
                                    <th className="p-3 text-left font-semibold">Role</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-3">John Doe</td>
                                    <td className="p-3">Admin</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">Active</span></td>
                                </tr>
                                <tr className="border-t">
                                    <td className="p-3">Jane Smith</td>
                                    <td className="p-3">User</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">Pending</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Verification Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3 text-blue-900">✓ Verification Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                    <li>Open DevTools (F12)</li>
                    <li>Right-click any text and select "Inspect"</li>
                    <li>Check "Computed" tab → "font-family"</li>
                    <li>Should show: <code className="bg-blue-100 px-2 py-1 rounded">"Science Gothic", sans-serif</code></li>
                    <li>Go to Network tab → Filter "Font"</li>
                    <li>Refresh page and verify Science Gothic font loads</li>
                </ol>
            </div>
        </div>
    );
};

export default FontTest;

/* 
USAGE:
------
To test the font implementation, temporarily add this component to any page:

import FontTest from './path/to/FontTest';

function YourPage() {
  return (
    <div>
      <FontTest />
      {/* Your existing content *\/}
    </div>
  );
}

Then remove it once you've verified the font is working correctly.
*/
