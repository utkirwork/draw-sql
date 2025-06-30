import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, Download, Eye, Trash2, Edit } from 'lucide-react';

interface Diagram {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    is_template: boolean;
    database_type: string;
}

interface Framework {
    name: string;
    info: {
        name: string;
        version: string;
        description: string;
    };
    supportedFiles: string[];
}

const DiagramsPage: React.FC = () => {
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [exportingDiagram, setExportingDiagram] = useState<string | null>(null);
    const [selectedFramework, setSelectedFramework] = useState<string>('yii2');
    const [namespace, setNamespace] = useState<string>('app');

    const [newDiagram, setNewDiagram] = useState({
        name: '',
        description: '',
        database_type: 'postgresql'
    });

    useEffect(() => {
        fetchDiagrams();
        fetchFrameworks();
    }, []);

    const fetchDiagrams = async () => {
        try {
            const response = await fetch('/api/diagrams', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setDiagrams(data.diagrams || []);
            }
        } catch (error) {
            console.error('Error fetching diagrams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFrameworks = async () => {
        try {
            const response = await fetch('/api/export/frameworks', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setFrameworks(data.frameworks || []);
            }
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        }
    };

    const handleCreateDiagram = async () => {
        try {
            const response = await fetch('/api/diagrams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newDiagram)
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewDiagram({ name: '', description: '', database_type: 'postgresql' });
                fetchDiagrams();
            }
        } catch (error) {
            console.error('Error creating diagram:', error);
        }
    };

    const handleExportDiagram = async (diagramId: string) => {
        try {
            setExportingDiagram(diagramId);
            
            const response = await fetch(`/api/export/${selectedFramework}/${diagramId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    namespace: namespace
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Get filename from response headers
                const contentDisposition = response.headers.get('content-disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
                    : `diagram_${selectedFramework}_export.zip`;
                
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Export failed');
            }
        } catch (error) {
            console.error('Error exporting diagram:', error);
            alert('Export failed');
        } finally {
            setExportingDiagram(null);
        }
    };

    const handleDeleteDiagram = async (diagramId: string) => {
        if (!confirm('Are you sure you want to delete this diagram?')) return;

        try {
            const response = await fetch(`/api/diagrams/${diagramId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                fetchDiagrams();
            }
        } catch (error) {
            console.error('Error deleting diagram:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Diagrams</h1>
                        <p className="text-gray-600 mt-2">Create and manage your database diagrams</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        New Diagram
                    </motion.button>
                </div>

                {/* Export Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
                    <div className="flex gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                            <select
                                value={selectedFramework}
                                onChange={(e) => setSelectedFramework(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[120px]"
                            >
                                {frameworks.map((framework) => (
                                    <option key={framework.name} value={framework.name}>
                                        {framework.info.name} {framework.info.version}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Namespace</label>
                            <input
                                type="text"
                                value={namespace}
                                onChange={(e) => setNamespace(e.target.value)}
                                placeholder="app"
                                className="border border-gray-300 rounded-lg px-3 py-2 min-w-[120px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Diagrams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diagrams.map((diagram) => (
                        <motion.div
                            key={diagram.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{diagram.name}</h3>
                                        <p className="text-sm text-gray-500">{diagram.database_type}</p>
                                    </div>
                                </div>
                            </div>

                            {diagram.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {diagram.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <Clock className="h-4 w-4" />
                                <span>Updated {formatDate(diagram.updated_at)}</span>
                            </div>

                            <div className="flex justify-between gap-2">
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.location.href = `/diagram/${diagram.id}`}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Diagram"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.location.href = `/diagram/${diagram.id}/edit`}
                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Edit Diagram"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeleteDiagram(diagram.id)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Diagram"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleExportDiagram(diagram.id)}
                                    disabled={exportingDiagram === diagram.id}
                                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    <Download className="h-4 w-4" />
                                    {exportingDiagram === diagram.id ? 'Exporting...' : 'Export'}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {diagrams.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet</h3>
                        <p className="text-gray-600 mb-6">Create your first database diagram to get started</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Diagram
                        </motion.button>
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-semibold mb-4">Create New Diagram</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newDiagram.name}
                                        onChange={(e) => setNewDiagram({ ...newDiagram, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="My Database Schema"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newDiagram.description}
                                        onChange={(e) => setNewDiagram({ ...newDiagram, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Optional description"
                                        rows={3}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                                    <select
                                        value={newDiagram.database_type}
                                        onChange={(e) => setNewDiagram({ ...newDiagram, database_type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="postgresql">PostgreSQL</option>
                                        <option value="mysql">MySQL</option>
                                        <option value="sqlite">SQLite</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDiagram}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagramsPage; 