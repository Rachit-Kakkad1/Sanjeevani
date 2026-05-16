import React from 'react';

const CghsTable = ({ data, loading }) => {
  if (loading && (!data || data.length === 0)) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl font-medium">No procedures found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-xl z-10 border-b border-white/10">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider">Code</th>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider">Procedure Name</th>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider text-right">Non-NABH</th>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider text-right">NABH</th>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider text-right">Super Speciality</th>
            <th className="px-6 py-4 text-xs font-semibold text-teal-400 uppercase tracking-wider">Classification</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item) => (
            <tr 
              key={item._id} 
              className="group hover:bg-white/5 transition-colors duration-200"
            >
              <td className="px-6 py-4 text-sm font-mono text-gray-400 group-hover:text-teal-400 transition-colors">
                {item.code}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                  {item.canonicalName}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-300">
                ₹{(item.nonNABH ?? item.pricing?.tier1?.nonNABH)?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-300">
                ₹{(item.NABH ?? item.pricing?.tier1?.NABH)?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-teal-500">
                ₹{(item.superSpeciality ?? item.pricing?.tier1?.superSpeciality)?.toLocaleString() || '-'}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-400 border border-white/5 group-hover:bg-teal-500/10 group-hover:text-teal-400 group-hover:border-teal-500/20 transition-all">
                  {item.classification}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CghsTable;
