import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userData, setUserData] = useState({ incomes: [], expenses: [] });

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
      if (selectedUserId === id) {
        setSelectedUserId(null);
        setUserData({ incomes: [], expenses: [] });
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const viewUserData = async (id) => {
    try {
      const [incomesRes, expensesRes] = await Promise.all([
        API.get(`/admin/users/${id}/incomes`),
        API.get(`/admin/users/${id}/expenses`)
      ]);
      setUserData({
        incomes: incomesRes.data,
        expenses: expensesRes.data
      });
      setSelectedUserId(id);
    } catch (err) {
      toast.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Admin Panel</h2>
      <div className="row">
        {users.map((u) => (
          <div className="col-md-4" key={u._id}>
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5>{u.name}</h5>
                <p>Email: {u.email}</p>
                <p>Mobile: {u.mobile}</p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => viewUserData(u._id)}
                  >
                    View Data
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUserId && (
        <div className="mt-5">
          <h4 className="mb-3">Transactions for Selected User</h4>

          <div className="row">
            <div className="col-md-6">
              <h5>Incomes</h5>
              <ul className="list-group mb-4">
                {userData.incomes.length === 0 && <li className="list-group-item">No income found.</li>}
                {userData.incomes.map((i, index) => (
                  <li key={index} className="list-group-item">
                    ₹{i.amount} - {i.category} ({i.method}) on {i.date?.slice(0, 10)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-md-6">
              <h5>Expenses</h5>
              <ul className="list-group mb-4">
                {userData.expenses.length === 0 && <li className="list-group-item">No expenses found.</li>}
                {userData.expenses.map((e, index) => (
                  <li key={index} className="list-group-item">
                    ₹{e.amount} - {e.category} ({e.method}) on {e.date?.slice(0, 10)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
