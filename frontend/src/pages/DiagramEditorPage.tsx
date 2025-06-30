import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, ArrowLeft, Home, Grid3X3, Download } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Column {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  referencedTable?: string;
  referencedColumn?: string;
}

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: Column[];
}

interface Relationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export const DiagramEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingColumn, setEditingColumn] = useState<{ tableId: string; columnId: string } | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipStart, setRelationshipStart] = useState<{ tableId: string; columnId: string } | null>(null);
  const [showForeignKeyModal, setShowForeignKeyModal] = useState(false);
  const [foreignKeyData, setForeignKeyData] = useState<{
    fromTableId: string;
    fromColumnId: string;
    toTableId?: string;
    toColumnId?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [diagramId, setDiagramId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSave, setAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    framework: 'yii2',
    namespace: 'app\\models',
    generateMigration: true,
    generateModel: true,
    generateRepository: true
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const { token, isAuthenticated } = useAuthStore();

  // Load diagram data
  const loadDiagram = async (diagramId: string) => {
    if (!token) return;

    try {
              const response = await fetch(`/api/diagrams/${diagramId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const diagram = result.data;
        
        // Set the diagram data
        setDiagramName(diagram.title || diagram.name || 'Untitled Diagram');
        setDiagramId(diagram.id);
        
        // Parse the canvas data
        if (diagram.canvas_data) {
          const canvasData = typeof diagram.canvas_data === 'string' 
            ? JSON.parse(diagram.canvas_data) 
            : diagram.canvas_data;
          
          if (canvasData.tables) {
            setTables(canvasData.tables);
          }
          if (canvasData.relationships) {
            setRelationships(canvasData.relationships);
          }
        }
        
        setHasUnsavedChanges(false);
      } else {
        console.error('Failed to load diagram');
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
    }
  };

  // Initialize diagram on mount
  useEffect(() => {
    if (id && token) {
      loadDiagram(id);
    } else if (!id) {
      // New diagram - start fresh
      setTables([]);
      setRelationships([]);
      setDiagramName('Untitled Diagram');
      setDiagramId(null);
      setHasUnsavedChanges(false);
    }
  }, [id, token]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (saveStatus !== 'saving') {
          saveDiagram();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveStatus]); // Remove saveDiagram dependency to avoid the error

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !diagramId) return;

    const autoSaveTimer = setTimeout(() => {
      if (saveStatus === 'idle') {
        saveDiagram();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [tables, relationships, diagramName, autoSave, hasUnsavedChanges, diagramId, saveStatus]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [tables, relationships, diagramName]);

  const addTable = () => {
    if (newTableName.trim()) {
      const newTable: Table = {
        id: `${newTableName}-table`,
        name: newTableName,
        x: 100 + tables.length * 50,
        y: 150 + tables.length * 50,
        columns: [
          {
            id: `${newTableName}-id`,
            name: 'id',
            type: 'UUID',
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          }
        ]
      };
      setTables([...tables, newTable]);
      setNewTableName('');
      setIsAddingTable(false);
    }
  };

  const addColumn = (tableId: string) => {
    const newColumn: Column = {
      id: `${tableId}-${Date.now()}`,
      name: 'new_column',
      type: 'VARCHAR',
      isPrimaryKey: false,
      isForeignKey: false,
      isNullable: true
    };

    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, columns: [...table.columns, newColumn] }
        : table
    ));
  };

  const updateColumn = (tableId: string, columnId: string, updates: Partial<Column>) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? {
            ...table,
            columns: table.columns.map(column =>
              column.id === columnId ? { ...column, ...updates } : column
            )
          }
        : table
    ));
  };

  const deleteColumn = (tableId: string, columnId: string) => {
    const table = tables.find(t => t.id === tableId);
    const column = table?.columns.find(c => c.id === columnId);
    
    if (table && column) {
      // Remove any relationships involving this column
      setRelationships(relationships.filter(rel => 
        !(rel.fromTable === table.name && rel.fromColumn === column.name) &&
        !(rel.toTable === table.name && rel.toColumn === column.name)
      ));
    }

    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, columns: table.columns.filter(column => column.id !== columnId) }
        : table
    ));
  };

  const deleteTable = (tableId: string) => {
    setTables(tables.filter(table => table.id !== tableId));
    // Also remove any relationships involving this table
    setRelationships(relationships.filter(rel => 
      rel.fromTable !== tableId.replace('-table', '') && rel.toTable !== tableId.replace('-table', '')
    ));
  };

  const createForeignKey = (fromTableId: string, fromColumnId: string, toTableId: string, toColumnId: string) => {
    const fromTable = tables.find(t => t.id === fromTableId);
    const toTable = tables.find(t => t.id === toTableId);
    const fromColumn = fromTable?.columns.find(c => c.id === fromColumnId);
    const toColumn = toTable?.columns.find(c => c.id === toColumnId);
    
    if (!fromTable || !toTable || !fromColumn || !toColumn) return;

    // First, remove any existing relationships for this column
    if (fromColumn.isForeignKey) {
      // Remove existing relationships involving this column
      setRelationships(prev => prev.filter(rel => 
        !(rel.toTable === fromTable.name && rel.toColumn === fromColumn.name)
      ));
    }

    // Update the column to be a foreign key
    updateColumn(fromTableId, fromColumnId, {
      isForeignKey: true,
      referencedTable: toTable.name,
      referencedColumn: toColumn.name
    });

    // Add new relationship
    const newRelationship: Relationship = {
      id: `rel-${Date.now()}`,
      fromTable: toTable.name,
      fromColumn: toColumn.name,
      toTable: fromTable.name,
      toColumn: fromColumn.name
    };

    setRelationships(prev => [...prev, newRelationship]);
  };

  // Drag & Drop Functions
  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setIsDragging(tableId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.round(e.clientX - canvasRect.left - dragOffset.x);
    const newY = Math.round(e.clientY - canvasRect.top - dragOffset.y);

    setTables(tables.map(table =>
      table.id === isDragging
        ? { ...table, x: Math.max(0, newX), y: Math.max(0, newY) }
        : table
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Foreign Key Creation Functions
  const startForeignKeyCreation = (tableId: string, columnId: string) => {
    const table = tables.find(t => t.id === tableId);
    const column = table?.columns.find(c => c.id === columnId);
    
    // If column already has a foreign key, pre-populate the modal with existing data
    let initialData = {
      fromTableId: tableId,
      fromColumnId: columnId,
      toTableId: undefined as string | undefined,
      toColumnId: undefined as string | undefined
    };

    if (column?.isForeignKey && column.referencedTable && column.referencedColumn) {
      const referencedTable = tables.find(t => t.name === column.referencedTable);
      const referencedColumn = referencedTable?.columns.find(c => c.name === column.referencedColumn);
      
      if (referencedTable && referencedColumn) {
        initialData.toTableId = referencedTable.id;
        initialData.toColumnId = referencedColumn.id;
      }
    }

    setForeignKeyData(initialData);
    setShowForeignKeyModal(true);
  };

  const completeForeignKeyCreation = () => {
    if (foreignKeyData?.fromTableId && foreignKeyData?.fromColumnId && 
        foreignKeyData?.toTableId && foreignKeyData?.toColumnId) {
      createForeignKey(
        foreignKeyData.fromTableId,
        foreignKeyData.fromColumnId,
        foreignKeyData.toTableId,
        foreignKeyData.toColumnId
      );
    }
    setShowForeignKeyModal(false);
    setForeignKeyData(null);
  };

  // Helper function to get column position within a table
  const getColumnPosition = (tableName: string, columnName: string) => {
    const table = tables.find(t => t.name === tableName);
    if (!table) return null;
    
    const columnIndex = table.columns.findIndex(c => c.name === columnName);
    if (columnIndex === -1) return null;
    
    const headerHeight = 50; // Height of table header
    const rowHeight = 32; // Height of each column row
    const padding = 16; // Padding inside table
    
    return {
      x: Math.round(table.x + 280), // Right edge of table for outgoing connections
      y: Math.round(table.y + headerHeight + padding + (columnIndex * rowHeight) + (rowHeight / 2)),
      leftX: Math.round(table.x), // Left edge for incoming connections
    };
  };

  const deleteRelationship = (relationshipId: string) => {
    const relationship = relationships.find(r => r.id === relationshipId);
    if (relationship) {
      // Find and update the foreign key column
      const toTable = tables.find(t => t.name === relationship.toTable);
      const toColumn = toTable?.columns.find(c => c.name === relationship.toColumn);
      
      if (toTable && toColumn) {
        updateColumn(toTable.id, toColumn.id, {
          isForeignKey: false,
          referencedTable: undefined,
          referencedColumn: undefined
        });
      }
    }
    
    setRelationships(relationships.filter(rel => rel.id !== relationshipId));
  };

  const removeForeignKey = (tableId: string, columnId: string) => {
    const table = tables.find(t => t.id === tableId);
    const column = table?.columns.find(c => c.id === columnId);
    
    if (table && column && column.isForeignKey) {
      // Remove the relationship
      setRelationships(prev => prev.filter(rel => 
        !(rel.toTable === table.name && rel.toColumn === column.name)
      ));
      
      // Update the column to remove foreign key
      updateColumn(tableId, columnId, {
        isForeignKey: false,
        referencedTable: undefined,
        referencedColumn: undefined
      });
    }
  };

  const saveDiagram = async () => {
    if (!isAuthenticated || !token) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const diagramData = {
        title: diagramName,
        canvas_data: JSON.stringify({
          tables: tables,
          relationships: relationships
        }),
        description: `Database diagram with ${tables.length} tables and ${relationships.length} relationships`
      };

      const url = diagramId 
        ? `/api/diagrams/${diagramId}`
        : '/api/diagrams';
      
      const method = diagramId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(diagramData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Diagram saved successfully:', result);
        
        // Set diagram ID if it's a new diagram
        if (!diagramId && result.data?.id) {
          setDiagramId(result.data.id);
        }
        
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save diagram');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      setSaveStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Export functions
  const exportDiagram = async () => {
    if (!diagramId || !token) {
      alert('Please save the diagram first before exporting');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${exportConfig.framework}/${diagramId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          namespace: exportConfig.namespace,
          generateMigration: exportConfig.generateMigration,
          generateModel: exportConfig.generateModel,
          generateRepository: exportConfig.generateRepository
        })
      });

      if (response.ok) {
        // Get the filename from the response header or generate one
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${diagramName}_${exportConfig.framework}_${Date.now()}.zip`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create a blob and download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setShowExportModal(false);
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    return;
                  }
                  navigate('/dashboard');
                }}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Dashboard"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    return;
                  }
                  navigate('/diagrams');
                }}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="All Diagrams"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Diagrams
              </button>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <h1 className="text-lg font-semibold text-gray-900">Diagram Editor</h1>
            <span className="text-sm text-gray-500">•</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                className="text-sm text-gray-700 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-gray-300 focus:px-2 focus:py-1 focus:rounded"
                placeholder="Diagram name"
              />
              {hasUnsavedChanges && (
                <span className="text-xs text-orange-600 font-medium">•</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to create a new diagram? Unsaved changes will be lost.')) {
                  // Reset diagram state
                  setTables([]);
                  setRelationships([]);
                  setDiagramName('Untitled Diagram');
                  setDiagramId(null);
                  setSaveStatus('idle');
                  setHasUnsavedChanges(false);
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              New
            </button>
            <button 
              onClick={() => setAutoSave(!autoSave)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                autoSave 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={autoSave ? 'Auto-save enabled' : 'Auto-save disabled'}
            >
              Auto-save {autoSave ? '✓' : '✗'}
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
              Share
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              disabled={!diagramId}
              className="flex items-center px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              title={diagramId ? 'Export diagram code' : 'Save diagram first to export'}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            <button
              onClick={saveDiagram}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:cursor-not-allowed'
              }`}
            >
              {saveStatus === 'saving' && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saveStatus === 'saved' && <span>✓</span>}
              {saveStatus === 'error' && <span>✗</span>}
              <span>
                {saveStatus === 'saving' 
                  ? 'Saving...' 
                  : saveStatus === 'saved' 
                  ? 'Saved!' 
                  : saveStatus === 'error'
                  ? 'Error'
                  : diagramId ? 'Update' : 'Save'
                }
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold mb-4">Database Tables</h3>
          
          <button
            onClick={() => setIsAddingTable(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </button>

          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{table.name}</h4>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">{table.columns.length} columns</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full relative overflow-auto"
            style={{ minWidth: '1200px', minHeight: '800px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Canvas Grid */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* SVG for relationship lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minWidth: '1200px', minHeight: '800px' }}>
              {/* Render relationship lines */}
              {relationships.map((rel) => {
                const fromPos = getColumnPosition(rel.fromTable, rel.fromColumn);
                const toPos = getColumnPosition(rel.toTable, rel.toColumn);
                
                if (!fromPos || !toPos) return null;

                // Create curved path connecting the tables
                const startX = fromPos.x;
                const startY = fromPos.y;
                const endX = toPos.leftX;
                const endY = toPos.y;
                
                const midX = (startX + endX) / 2;
                const path = `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + endY) / 2} Q ${midX} ${endY} ${endX} ${endY}`;

                return (
                  <g key={`${rel.fromTable}-${rel.toTable}-${rel.fromColumn}-${rel.toColumn}`}>
                    {/* Connection line */}
                    <path
                      d={path}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="0"
                    />
                    
                    {/* Start circle */}
                    <circle
                      cx={startX}
                      cy={startY}
                      r="4"
                      fill="#3b82f6"
                    />
                    
                    {/* End circle */}
                    <circle
                      cx={endX}
                      cy={endY}
                      r="4"
                      fill="#3b82f6"
                    />
                    
                    {/* Delete button */}
                    <circle
                      cx={midX}
                      cy={(startY + endY) / 2}
                      r="8"
                      fill="white"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onClick={() => deleteRelationship(rel.id)}
                    />
                    <text
                      x={midX}
                      y={(startY + endY) / 2 + 1}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#ef4444"
                      className="cursor-pointer select-none"
                      onClick={() => deleteRelationship(rel.id)}
                    >
                      ×
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tables */}
            {tables.map((table) => (
              <div
                key={table.id}
                className={`absolute bg-white rounded-lg shadow-lg border-2 min-w-64 ${
                  isDragging === table.id ? 'border-blue-500 shadow-xl' : 'border-gray-200'
                }`}
                style={{
                  left: Math.round(table.x),
                  top: Math.round(table.y),
                  cursor: isDragging === table.id ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleMouseDown(e, table.id)}
              >
                {/* Table Header */}
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                  <h3 className="font-semibold">{table.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addColumn(table.id);
                    }}
                    className="text-white hover:bg-blue-700 p-1 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Table Columns */}
                <div className="p-0">
                  {table.columns.map((column, index) => (
                    <div 
                      key={column.id} 
                      className={`px-4 py-2 border-b border-gray-100 last:border-b-0 flex items-center justify-between hover:bg-gray-50 ${
                        column.isPrimaryKey ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <span className={`font-medium ${column.isPrimaryKey ? 'text-yellow-700' : 'text-gray-700'}`}>
                          {column.name}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">
                          {column.type}
                        </span>
                        {column.isPrimaryKey && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded">PK</span>
                        )}
                        {!column.isNullable && (
                          <span className="text-xs text-red-600">NOT NULL</span>
                        )}
                        {column.isForeignKey && (
                          <span className="text-xs bg-green-200 text-green-800 px-1 rounded">
                            FK → {column.referencedTable}.{column.referencedColumn}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingColumn({ tableId: table.id, columnId: column.id });
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit Column"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {column.isForeignKey ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeForeignKey(table.id, column.id);
                            }}
                            className="text-gray-400 hover:text-orange-600 p-1"
                            title="Remove Foreign Key"
                          >
                            🔓
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startForeignKeyCreation(table.id, column.id);
                            }}
                            className="text-gray-400 hover:text-green-600 p-1"
                            title="Create Foreign Key"
                          >
                            🔗
                          </button>
                        )}
                        {column.isForeignKey && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startForeignKeyCreation(table.id, column.id);
                            }}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Edit Foreign Key"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteColumn(table.id, column.id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Foreign Key Creation Modal */}
      {showForeignKeyModal && foreignKeyData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {(() => {
                const fromTable = tables.find(t => t.id === foreignKeyData.fromTableId);
                const fromColumn = fromTable?.columns.find(c => c.id === foreignKeyData.fromColumnId);
                return fromColumn?.isForeignKey ? 'Update Foreign Key Relationship' : 'Create Foreign Key Relationship';
              })()}
            </h3>
            {(() => {
              const fromTable = tables.find(t => t.id === foreignKeyData.fromTableId);
              const fromColumn = fromTable?.columns.find(c => c.id === foreignKeyData.fromColumnId);
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="text-sm text-gray-600">
                      {fromTable?.name}.{fromColumn?.name} ({fromColumn?.type})
                    </div>
                    {fromColumn?.isForeignKey && (
                      <div className="text-xs text-blue-600 mt-1">
                        Currently: FK → {fromColumn.referencedTable}.{fromColumn.referencedColumn}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Table</label>
                    <select
                      value={foreignKeyData.toTableId || ''}
                      onChange={(e) => setForeignKeyData({
                        ...foreignKeyData,
                        toTableId: e.target.value,
                        toColumnId: undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select table...</option>
                      {tables
                        .filter(t => t.id !== foreignKeyData.fromTableId)
                        .map(table => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {foreignKeyData.toTableId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Column</label>
                      <select
                        value={foreignKeyData.toColumnId || ''}
                        onChange={(e) => setForeignKeyData({
                          ...foreignKeyData,
                          toColumnId: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select column...</option>
                        {tables
                          .find(t => t.id === foreignKeyData.toTableId)
                          ?.columns.filter(col => col.isPrimaryKey || col.type === fromColumn?.type)
                          .map(column => (
                            <option key={column.id} value={column.id}>
                              {column.name} ({column.type}) {column.isPrimaryKey ? '(PK)' : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={completeForeignKeyCreation}
                      disabled={!foreignKeyData.toTableId || !foreignKeyData.toColumnId}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {fromColumn?.isForeignKey ? 'Update Relationship' : 'Create Relationship'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForeignKeyModal(false);
                        setForeignKeyData(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Column Edit Modal */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Column</h3>
            {(() => {
              const table = tables.find(t => t.id === editingColumn.tableId);
              const column = table?.columns.find(c => c.id === editingColumn.columnId);
              if (!column) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(editingColumn.tableId, editingColumn.columnId, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(editingColumn.tableId, editingColumn.columnId, { type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="TEXT">TEXT</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="BIGINT">BIGINT</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="UUID">UUID</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={column.isPrimaryKey}
                        onChange={(e) => updateColumn(editingColumn.tableId, editingColumn.columnId, { isPrimaryKey: e.target.checked })}
                        className="mr-2"
                      />
                      Primary Key
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!column.isNullable}
                        onChange={(e) => updateColumn(editingColumn.tableId, editingColumn.columnId, { isNullable: !e.target.checked })}
                        className="mr-2"
                      />
                      Not Null
                    </label>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setEditingColumn(null)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingColumn(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Table</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter table name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && addTable()}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={addTable}
                  disabled={!newTableName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Table
                </button>
                <button
                  onClick={() => {
                    setIsAddingTable(false);
                    setNewTableName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Export Diagram</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                <select
                  value={exportConfig.framework}
                  onChange={(e) => setExportConfig({...exportConfig, framework: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="yii2">Yii2 Framework</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
                <input
                  type="text"
                  value={exportConfig.namespace}
                  onChange={(e) => setExportConfig({...exportConfig, namespace: e.target.value})}
                  placeholder="app\\models"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generate Files</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.generateMigration}
                      onChange={(e) => setExportConfig({...exportConfig, generateMigration: e.target.checked})}
                      className="mr-2"
                    />
                    Database Migrations
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.generateModel}
                      onChange={(e) => setExportConfig({...exportConfig, generateModel: e.target.checked})}
                      className="mr-2"
                    />
                    ActiveRecord Models
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.generateRepository}
                      onChange={(e) => setExportConfig({...exportConfig, generateRepository: e.target.checked})}
                      className="mr-2"
                    />
                    Repository Classes
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={exportDiagram}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export & Download
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 