import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import adminService from '../../services/adminService';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const ActivityLogs = () => {
  const { user } = useSelector(state => state.auth);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  
  useEffect(() => {
    fetchLogs();
  }, [viewMode]);
  
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let data;
      if (viewMode === 'all') {
        data = await adminService.getActivityLogs();
      } else {
        data = await adminService.getMyActivityLogs();
      }
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load activity logs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to get action badge color
  const getActionBadgeClass = (action) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'all' ? 'primary' : 'outline'}
            onClick={() => setViewMode('all')}
          >
            All Logs
          </Button>
          <Button 
            variant={viewMode === 'my' ? 'primary' : 'outline'}
            onClick={() => setViewMode('my')}
          >
            My Logs
          </Button>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} className="mb-6" />}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.adminName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md break-words">
                          {log.details}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;