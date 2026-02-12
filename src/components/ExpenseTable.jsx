import React from 'react';

export default function ExpenseTable({ expenses, onDelete }) {
  if (!expenses?.length) {
    return <p style={{ color: 'var(--text-muted)' }}>No expenses to display.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Status</th>
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td>{exp.date}</td>
              <td>{exp.vendor || '\u2014'}</td>
              <td style={{ fontWeight: 600 }}>${(exp.amount || 0).toFixed(2)}</td>
              <td>{exp.category || '\u2014'}</td>
              <td><span className={`badge badge-${exp.status}`}>{exp.status}</span></td>
              {onDelete && (
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(exp.id)}>Del</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
