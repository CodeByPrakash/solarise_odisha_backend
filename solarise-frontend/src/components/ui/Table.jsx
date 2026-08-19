import React from 'react';

export const Table = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        {children}
      </table>
    </div>
  );
};

Table.Header = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  );
};

Table.HeaderCell = ({ children, className = '' }) => {
  return (
    <th className={`${className} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
      {children}
    </th>
  );
};

Table.Body = ({ children }) => {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
};

Table.Row = ({ children, className = '', onClick }) => {
  return <tr className={className} onClick={onClick}>{children}</tr>;
};

Table.Cell = ({ children, className = '' }) => {
  return (
    <td className={`${className} px-4 py-3 text-sm text-gray-900`}>
      {children}
    </td>
  );
};

export default Table;