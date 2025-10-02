import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Home, Grid3X3, Download, ChevronUp, ChevronDown, ChevronDown as ChevronDownIcon, ChevronRight } from 'lucide-react';
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
  defaultValue?: string;
}

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: Column[];
  isCollapsed?: boolean;
  priority?: number;
  color?: string;
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

  // const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingColumn, setEditingColumn] = useState<{ tableId: string; columnId: string } | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  // const [relationshipStart, setRelationshipStart] = useState<{ tableId: string; columnId: string } | null>(null);
  const [showForeignKeyModal, setShowForeignKeyModal] = useState(false);
  const [foreignKeyData, setForeignKeyData] = useState<{
    fromTableId: string;
    fromColumnId: string;
    toTableId?: string;
    toColumnId?: string;
  } | null>(null);
  
  const [showTableEditModal, setShowTableEditModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [diagramId, setDiagramId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSave, setAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'framework' | 'sql' | 'pdf'>('framework');
  
  const [exportConfig, setExportConfig] = useState({
    framework: 'yii2',
    namespace: 'xbsoft\\untitled_diagram',
    schemaName: 'public',
    databaseType: 'postgresql',
    generateMigration: true,
    generateModel: true,
    generateRepository: true,
    selectedTables: [] as string[],
    skipExistingEntities: true,
    documentTitle: ''
  });

  // Debug: Log export type changes
  useEffect(() => {
    console.log('Export type changed to:', exportType);
  }, [exportType]);

  // Initialize document title when export modal opens
  useEffect(() => {
    if (showExportModal && (!exportConfig.documentTitle || exportConfig.documentTitle === '')) {
      const newTitle = diagramName || 'Database Schema Documentation';
      setExportConfig(prev => ({
        ...prev,
        documentTitle: newTitle
      }));
    }
  }, [showExportModal, diagramName, exportConfig.documentTitle]);
  const [orderedTables, setOrderedTables] = useState<Table[]>([]);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { token, isAuthenticated } = useAuthStore();

  // Sort tables by priority first, then by dependencies
  const sortTablesByDependencies = (tables: Table[]): Table[] => {
    // First, sort by priority (if priority property exists)
    const tablesWithPriority = tables.map(table => {
      const priority = table.priority || 999;
      return { table, priority };
    });
    
    // Sort by priority (lower number = higher priority)
    tablesWithPriority.sort((a, b) => a.priority - b.priority);
    
    const sortedTables = tablesWithPriority.map(item => item.table);
    
    // For export modal, we only need priority sorting
    // For migration generation, we need dependency sorting
    return sortedTables;
  };

  // Sort tables by dependencies for migration generation
  const sortTablesByDependenciesForMigration = (tables: Table[]): Table[] => {
    // First, sort by priority (if priority property exists)
    const tablesWithPriority = tables.map(table => {
      const priority = table.priority || 999;
      return { table, priority };
    });
    
    // Sort by priority (lower number = higher priority)
    tablesWithPriority.sort((a, b) => a.priority - b.priority);
    
    const sortedTables = tablesWithPriority.map(item => item.table);
    
    // Then apply dependency sorting within same priority groups
    const sorted: Table[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    // First, add all independent tables (tables with no foreign keys)
    const independentTables = sortedTables.filter(table => 
      !relationships.some(rel => rel.fromTable === table.name)
    );
    
    // Add independent tables first
    for (const table of independentTables) {
      if (!visited.has(table.name)) {
        visited.add(table.name);
        sorted.push(table);
      }
    }
    
    const visit = (table: Table) => {
      if (visiting.has(table.name)) {
        // Circular dependency detected, add table anyway
        return;
      }
      if (visited.has(table.name)) {
        return;
      }
      
      visiting.add(table.name);
      
      // Find tables that this table depends on (foreign keys)
      const dependencies = relationships
        .filter(rel => rel.fromTable === table.name)
        .map(rel => tables.find(t => t.name === rel.toTable))
        .filter((dep): dep is Table => dep !== undefined);
      
      // Visit dependencies first
      for (const dep of dependencies) {
        visit(dep);
      }
      
      visiting.delete(table.name);
      visited.add(table.name);
      sorted.push(table);
    };
    
    // Visit dependent tables (tables with foreign keys)
    const dependentTables = tables.filter(table => 
      relationships.some(rel => rel.fromTable === table.name)
    );
    
    for (const table of dependentTables) {
      visit(table);
    }
    
    return sorted;
  };

  // Function to generate namespace from diagram name
  const generateNamespace = (diagramName: string) => {
    // First, clean the name but keep the original case
    let cleanName = diagramName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters but keep letters and numbers
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^[^a-zA-Z]/, 'd'); // Ensure it starts with a letter
    
    // Make only the first letter lowercase
    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
    }
    
    return `xbsoft\\${cleanName}`;
  };

  // Update namespace when diagram name changes
  useEffect(() => {
    console.log('Diagram name changed to:', diagramName);
    const newNamespace = generateNamespace(diagramName);
    console.log('Generated namespace:', newNamespace);
    setExportConfig(prev => ({
      ...prev,
      namespace: newNamespace
    }));
  }, [diagramName]);

  // Initialize selected tables and ordered tables when modal opens
  useEffect(() => {
    if (showExportModal && tables.length > 0) {
      console.log('Export modal opened, diagram name:', diagramName);
      console.log('Current export config namespace:', exportConfig.namespace);
      console.log('Current export type:', exportType);
      
      // Reset export type to framework when modal opens
      setExportType('framework');
      
      // If diagram name is still undefined, try to fetch it
      if (!diagramName || diagramName === 'Untitled Diagram') {
        console.log('Diagram name is undefined, attempting to fetch diagram data...');
        if (diagramId && token) {
          loadDiagram(diagramId);
        }
      }
      
      const allTableNames = tables.map(table => table.name);
      setExportConfig(prev => ({
        ...prev,
        selectedTables: allTableNames
      }));
      
      // Initialize ordered tables with priority-sorted tables
      const prioritySortedTables = [...tables].sort((a, b) => {
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        return priorityA - priorityB; // Ascending order
      });
      setOrderedTables(prioritySortedTables);
    }
  }, [showExportModal, tables, relationships]);

  // Update ordered tables when tables or relationships change
  useEffect(() => {
    if (tables.length > 0) {
      // First sort by priority (ascending), then by dependencies
      const prioritySortedTables = [...tables].sort((a, b) => {
        const priorityA = a.priority || 999;
        const priorityB = b.priority || 999;
        return priorityA - priorityB; // Ascending order
      });
      
      const sortedTables = sortTablesByDependencies(prioritySortedTables);
      console.log('🔍 Table sorting debug:', {
        original: tables.map(t => t.name),
        prioritySorted: prioritySortedTables.map(t => `${t.name} (P${t.priority || 'no priority'})`),
        finalSorted: sortedTables.map(t => `${t.name} (P${t.priority || 'no priority'})`),
        relationships: relationships.map(r => `${r.fromTable} → ${r.toTable}`)
      });
      setOrderedTables(prioritySortedTables);
    }
  }, [tables, relationships]);

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
        
        // Debug: Log the diagram data to see the structure
        console.log('Diagram data:', diagram);
        console.log('Diagram title:', diagram.title);
        console.log('Diagram name:', diagram.name);
        console.log('Canvas data:', diagram.canvas_data);
        
        // Set the diagram data - try multiple possible fields
        const diagramTitle = diagram.title || diagram.name || diagram.diagram_name || 'Untitled Diagram';
        console.log('Final diagram name:', diagramTitle);
        setDiagramName(diagramTitle);
        setDiagramId(diagram.id);
        
        // Parse the canvas data
        if (diagram.canvas_data) {
          const canvasData = typeof diagram.canvas_data === 'string' 
            ? JSON.parse(diagram.canvas_data) 
            : diagram.canvas_data;
          
          console.log('Parsed canvas data:', canvasData);
          console.log('Tables from canvas:', canvasData.tables);
          
          if (canvasData.tables) {
            // Add priority to existing tables if they don't have it
            const tablesWithPriority = canvasData.tables.map((table: any, index: number) => ({
              ...table,
              priority: table.priority || (index + 1)
            }));
            console.log('Tables with priority:', tablesWithPriority);
            setTables(tablesWithPriority);
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
      // Calculate priority: current table count + 1
      const priority = tables.length + 1;
      
      const newTable: Table = {
        id: `${newTableName}-table`,
        name: newTableName,
        x: 100 + tables.length * 50,
        y: 150 + tables.length * 50,
        priority: priority,
        columns: [
          {
            id: `${newTableName}-id`,
            name: 'id',
            type: 'UUID',
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          },
          // Default audit columns
          {
            id: `${newTableName}-created_by`,
            name: 'created_by',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-updated_by`,
            name: 'updated_by',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-created_at`,
            name: 'created_at',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-updated_at`,
            name: 'updated_at',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-deleted_by`,
            name: 'deleted_by',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-deleted_at`,
            name: 'deleted_at',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-is_deleted`,
            name: 'is_deleted',
            type: 'BOOLEAN',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
          },
          {
            id: `${newTableName}-status`,
            name: 'status',
            type: 'INTEGER',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true
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

  const moveColumnUp = (tableId: string, columnId: string) => {
    setTables(tables.map(table => {
      if (table.id !== tableId) return table;
      
      const columnIndex = table.columns.findIndex(col => col.id === columnId);
      if (columnIndex <= 0) return table; // Can't move up if it's the first column
      
      const newColumns = [...table.columns];
      [newColumns[columnIndex - 1], newColumns[columnIndex]] = [newColumns[columnIndex], newColumns[columnIndex - 1]];
      
      return { ...table, columns: newColumns };
    }));
  };

  const moveColumnDown = (tableId: string, columnId: string) => {
    setTables(tables.map(table => {
      if (table.id !== tableId) return table;
      
      const columnIndex = table.columns.findIndex(col => col.id === columnId);
      if (columnIndex >= table.columns.length - 1) return table; // Can't move down if it's the last column
      
      const newColumns = [...table.columns];
      [newColumns[columnIndex], newColumns[columnIndex + 1]] = [newColumns[columnIndex + 1], newColumns[columnIndex]];
      
      return { ...table, columns: newColumns };
    }));
  };

  const toggleTableCollapse = (tableId: string) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, isCollapsed: !table.isCollapsed }
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
    const tableWidth = 300; // Estimated actual table width (accounting for content width)
    
    if (table.isCollapsed) {
      // For collapsed tables, connect to the center of the table border
      const centerY = table.y + (headerHeight / 2);
      
      return {
        x: Math.round(table.x + tableWidth + 12), // Right edge + more margin to clear table
        y: Math.round(centerY), // Vertical center of collapsed table
        leftX: Math.round(table.x - 12), // Left edge - more margin to clear table
        leftY: Math.round(centerY), // Same position for left side
      };
    }
    
    // For expanded tables, connect to the specific column row at the table border
    const columnY = table.y + headerHeight + padding + (columnIndex * rowHeight) + (rowHeight / 2);
    
    return {
      x: Math.round(table.x + tableWidth + 12), // Right edge + more margin to clear table
      y: Math.round(columnY), // Specific column row position
      leftX: Math.round(table.x - 12), // Left edge - more margin to clear table
      leftY: Math.round(columnY), // Same column row position for left side
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
      const canvasData = {
        tables: tables,
        relationships: relationships
      };
      
      console.log('Saving diagram with canvas data:', canvasData);
      console.log('Tables being saved:', tables);
      
      const diagramData = {
        title: diagramName,
        canvas_data: JSON.stringify(canvasData),
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

  // Table selection functions
  const handleTableSelection = (tableName: string, isSelected: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      selectedTables: isSelected 
        ? [...prev.selectedTables, tableName]
        : prev.selectedTables.filter(name => name !== tableName)
    }));
  };

  const handleSelectAllTables = () => {
    const allTableNames = tables.map(table => table.name);
    setExportConfig(prev => ({
      ...prev,
      selectedTables: allTableNames
    }));
  };

  const handleDeselectAllTables = () => {
    setExportConfig(prev => ({
      ...prev,
      selectedTables: []
    }));
  };

  // Drag and drop handlers for table ordering
  const handleDragStart = (e: React.DragEvent, tableId: string) => {
    setDraggedTableId(tableId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTableId: string) => {
    e.preventDefault();
    
    if (!draggedTableId || draggedTableId === targetTableId) {
      setDraggedTableId(null);
      return;
    }

    const draggedIndex = orderedTables.findIndex(table => table.id === draggedTableId);
    const targetIndex = orderedTables.findIndex(table => table.id === targetTableId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTableId(null);
      return;
    }

    const newOrderedTables = [...orderedTables];
    const [draggedTable] = newOrderedTables.splice(draggedIndex, 1);
    newOrderedTables.splice(targetIndex, 0, draggedTable);
    
    setOrderedTables(newOrderedTables);
    setDraggedTableId(null);
  };

  const handleDragEnd = () => {
    setDraggedTableId(null);
  };

  // Export functions
  const exportDiagram = async () => {
    if (!diagramId || !token) {
      alert('Please save the diagram first before exporting');
      return;
    }

    console.log('Exporting diagram with type:', exportType);
    console.log('Diagram ID:', diagramId);
    console.log('Export config:', exportConfig);
    console.log('Current exportType state:', exportType);

    // Safety check - ensure export type is valid
    if (!['framework', 'sql', 'pdf'].includes(exportType)) {
      console.error('Invalid export type:', exportType);
      alert('Invalid export type. Please try again.');
      return;
    }

    // Additional safety check - ensure we're not using the old framework endpoint for SQL/PDF
    if (exportType === 'sql' || exportType === 'pdf') {
      console.log('Using new export endpoints for:', exportType);
    } else {
      console.log('Using framework export endpoint for:', exportType);
    }

    // Double-check export type before proceeding
    console.log('Final export type check:', exportType);

    setIsExporting(true);
    try {
      let response: Response;
      let filename: string;
      
      // Force explicit check for export types
      console.log('About to check export type. Current value:', exportType);
      console.log('Type of exportType:', typeof exportType);
      console.log('exportType === "sql":', exportType === 'sql');
      console.log('exportType === "pdf":', exportType === 'pdf');
      
      if (exportType === 'sql') {
        const url = `/api/export/sql/${diagramId}`;
        console.log('✅ SQL EXPORT: Making SQL export request to:', url);
        console.log('✅ SQL EXPORT: Request body:', {
          databaseType: exportConfig.databaseType,
          schemaName: exportConfig.schemaName
        });
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            databaseType: exportConfig.databaseType,
            schemaName: exportConfig.schemaName
          })
        });
        filename = `${diagramName}_schema_${Date.now()}.sql`;
      } else if (exportType === 'pdf') {
        const url = `/api/export/pdf/${diagramId}`;
        console.log('✅ PDF EXPORT: Making PDF export request to:', url);
        console.log('✅ PDF EXPORT: Request body:', {
          databaseType: exportConfig.databaseType,
          schemaName: exportConfig.schemaName,
          documentTitle: exportConfig.documentTitle
        });
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            databaseType: exportConfig.databaseType,
            schemaName: exportConfig.schemaName,
            documentTitle: exportConfig.documentTitle
          })
        });
        filename = `${diagramName}_documentation_${Date.now()}.pdf`;
      } else {
        // Framework export
        console.log('🚨 FALLBACK TO FRAMEWORK EXPORT - This might be wrong!');
        console.log('🚨 Export type was:', exportType);
        const url = `/api/export/${exportConfig.framework}/${diagramId}`;
        console.log('🔧 FRAMEWORK EXPORT: Making Framework export request to:', url);
        console.log('🔧 FRAMEWORK EXPORT: Request body:', {
          namespace: exportConfig.namespace,
          schemaName: exportConfig.schemaName,
          generateMigration: exportConfig.generateMigration,
          generateModel: exportConfig.generateModel,
          generateRepository: exportConfig.generateRepository,
          selectedTables: exportConfig.selectedTables,
          skipExistingEntities: exportConfig.skipExistingEntities,
          tableOrder: sortTablesByDependenciesForMigration(tables).map(table => table.name),
          tablesWithPriority: sortTablesByDependenciesForMigration(tables)
        });
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            namespace: exportConfig.namespace,
            schemaName: exportConfig.schemaName,
            generateMigration: exportConfig.generateMigration,
            generateModel: exportConfig.generateModel,
            generateRepository: exportConfig.generateRepository,
            selectedTables: exportConfig.selectedTables,
            skipExistingEntities: exportConfig.skipExistingEntities,
            tableOrder: sortTablesByDependenciesForMigration(tables).map(table => table.name),
          tablesWithPriority: sortTablesByDependenciesForMigration(tables)
          })
        });
        filename = `${diagramName}_generated_codes_${Date.now()}.zip`;
      }

      if (response.ok) {
        // Get the filename from the response header or use generated one
        const contentDisposition = response.headers.get('content-disposition');
        
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
              {/* Render relationship lines - show for all tables */}
              {relationships.map((rel) => {
                // Get table states first
                const fromTable = tables.find(t => t.name === rel.fromTable);
                const toTable = tables.find(t => t.name === rel.toTable);
                
                const fromPos = getColumnPosition(rel.fromTable, rel.fromColumn);
                const toPos = getColumnPosition(rel.toTable, rel.toColumn);
                
                if (!fromPos || !toPos) return null;

                const fromCollapsed = fromTable?.isCollapsed || false;
                const toCollapsed = toTable?.isCollapsed || false;

                // Create smooth curved path connecting the tables
                const startX = fromPos.x;
                const startY = fromPos.y;
                const endX = toPos.leftX;
                const endY = toPos.leftY || toPos.y;
                
                // Calculate control points for smooth curves
                const dx = endX - startX;
                const dy = endY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const controlOffset = Math.min(distance * 0.3, 100); // Dynamic curve based on distance
                
                const control1X = startX + controlOffset;
                const control1Y = startY;
                const control2X = endX - controlOffset;
                const control2Y = endY;
                
                const path = `M ${startX} ${startY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${endX} ${endY}`;
                
                // Calculate midX for delete button positioning
                const midX = (startX + endX) / 2;

                return (
                  <g key={`${rel.fromTable}-${rel.toTable}-${rel.fromColumn}-${rel.toColumn}`}>
                    {/* Connection line with gradient */}
                    <defs>
                      <linearGradient id={`gradient-${rel.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8"/>
                      </linearGradient>
                    </defs>
                    <path
                      d={path}
                      stroke={`url(#gradient-${rel.id})`}
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"
                    />
                    
                    {/* Start circle with better styling */}
                    <circle
                      cx={startX}
                      cy={startY}
                      r={fromCollapsed ? "4" : "5"}
                      fill={fromCollapsed ? "#e5e7eb" : "#ffffff"}
                      stroke={fromCollapsed ? "#9ca3af" : "#3b82f6"}
                      strokeWidth={fromCollapsed ? "2" : "2"}
                      filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))"
                    />
                    
                    {/* Collapsed table indicator - smaller and positioned better */}
                    {fromCollapsed && (
                      <text
                        x={startX}
                        y={startY + 1}
                        textAnchor="middle"
                        fontSize="6"
                        fontWeight="bold"
                        fill="#9ca3af"
                        className="pointer-events-none"
                      >
                        ⋯
                      </text>
                    )}
                    
                    {/* End circle with arrow indicator */}
                    <circle
                      cx={endX}
                      cy={endY}
                      r={toCollapsed ? "4" : "5"}
                      fill={toCollapsed ? "#e5e7eb" : "#ffffff"}
                      stroke={toCollapsed ? "#9ca3af" : "#3b82f6"}
                      strokeWidth={toCollapsed ? "2" : "2"}
                      filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))"
                    />
                    
                    {/* Collapsed table indicator - smaller and positioned better */}
                    {toCollapsed && (
                      <text
                        x={endX}
                        y={endY + 1}
                        textAnchor="middle"
                        fontSize="6"
                        fontWeight="bold"
                        fill="#9ca3af"
                        className="pointer-events-none"
                      >
                        ⋯
                      </text>
                    )}
                    
                    {/* Arrow head at the end */}
                    <polygon
                      points={`${endX-8},${endY-3} ${endX-8},${endY+3} ${endX-2},${endY}`}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    
                    {/* Delete button with better styling */}
                    <circle
                      cx={midX}
                      cy={(startY + endY) / 2}
                      r="10"
                      fill="#ffffff"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="cursor-pointer hover:fill-red-50"
                      onClick={() => deleteRelationship(rel.id)}
                      filter="drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))"
                    />
                    <text
                      x={midX}
                      y={(startY + endY) / 2 + 2}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#ef4444"
                      className="cursor-pointer select-none pointer-events-none"
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
                  cursor: isDragging === table.id ? 'grabbing' : 'grab',
                  zIndex: table.isCollapsed ? 20 : 30
                }}
                onMouseDown={(e) => handleMouseDown(e, table.id)}
              >
                {/* Table Header */}
                <div 
                  className="text-white px-4 py-2 rounded-t-lg flex items-center justify-between"
                  style={{ backgroundColor: table.color || '#2563eb' }}
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTableCollapse(table.id);
                      }}
                      className="text-white hover:bg-blue-700 p-1 rounded"
                      title={table.isCollapsed ? "Expand table" : "Collapse table"}
                    >
                      {table.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                    <h3 className="font-semibold">{table.name}</h3>
                    {table.priority && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded ml-1">
                        P{table.priority}
                      </span>
                    )}
                    {table.isCollapsed && (
                      <span className="text-xs text-blue-200">({table.columns.length} columns)</span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTable(table);
                        setShowTableEditModal(true);
                      }}
                      className="text-white hover:bg-blue-700 p-1 rounded"
                      title="Edit table"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addColumn(table.id);
                      }}
                      className="text-white hover:bg-blue-700 p-1 rounded"
                      title="Add Column"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table Columns */}
                {!table.isCollapsed && (
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
                          {/* Column reordering buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumnUp(table.id, column.id);
                            }}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Move Column Up"
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumnDown(table.id, column.id);
                            }}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Move Column Down"
                            disabled={index === table.columns.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
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
                )}
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

      {/* Table Edit Modal */}
      {showTableEditModal && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Table</h3>
            <div className="space-y-4">
              {/* Table Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input
                  type="number"
                  min="0"
                  value={editingTable.priority || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, priority: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter priority (0 = highest)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower number = higher priority (0 = first, 1 = second, etc.)
                </p>
              </div>
              
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editingTable.color || '#2563eb'}
                    onChange={(e) => setEditingTable({ ...editingTable, color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTable.color || '#2563eb'}
                    onChange={(e) => setEditingTable({ ...editingTable, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#2563eb"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a color for the table header
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setTables(tables.map(t => 
                    t.id === editingTable.id ? editingTable : t
                  ));
                  setShowTableEditModal(false);
                  setEditingTable(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowTableEditModal(false);
                  setEditingTable(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
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
          <div className="bg-white rounded-lg p-6 w-[700px] max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Export Diagram</h3>
            <div className="space-y-4">
              {/* Export Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      console.log('Setting export type to Framework');
                      setExportType('framework');
                      console.log('Export type set to:', 'framework');
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exportType === 'framework'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-sm font-medium">Framework Code</div>
                    <div className="text-xs text-gray-500">Generate application code</div>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Setting export type to SQL');
                      setExportType('sql');
                      console.log('Export type set to:', 'sql');
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exportType === 'sql'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🗄️</div>
                    <div className="text-sm font-medium">SQL Schema</div>
                    <div className="text-xs text-gray-500">Generate database schema</div>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Setting export type to PDF');
                      setExportType('pdf');
                      console.log('Export type set to:', 'pdf');
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exportType === 'pdf'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-sm font-medium">PDF Documentation</div>
                    <div className="text-xs text-gray-500">Generate documentation</div>
                  </button>
                </div>
              </div>

              {/* Database Type Selection (for SQL and PDF) */}
              {(exportType === 'sql' || exportType === 'pdf') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                  <select
                    value={exportConfig.databaseType}
                    onChange={(e) => setExportConfig({...exportConfig, databaseType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlserver">SQL Server</option>
                    <option value="mariadb">MariaDB</option>
                  </select>
                </div>
              )}

              {/* Framework Selection (only for framework export) */}
              {exportType === 'framework' && (
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
              )}
              
              {/* Namespace (only for framework export) */}
              {exportType === 'framework' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
                  <input
                    type="text"
                    value={exportConfig.namespace}
                    onChange={(e) => setExportConfig({...exportConfig, namespace: e.target.value})}
                    placeholder={generateNamespace(diagramName)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schema Name</label>
                <input
                  type="text"
                  value={exportConfig.schemaName}
                  onChange={(e) => setExportConfig({...exportConfig, schemaName: e.target.value})}
                  placeholder="public"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {exportType === 'framework' 
                    ? `Tables will be prefixed with this schema name (e.g., ${exportConfig.schemaName}.table_name)`
                    : `Database schema name for ${exportType.toUpperCase()} export`
                  }
                </p>
              </div>

              {/* Document Title (for PDF export) */}
              {exportType === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={exportConfig.documentTitle}
                    onChange={(e) => setExportConfig({...exportConfig, documentTitle: e.target.value})}
                    placeholder={diagramName || "Database Schema Documentation"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Title that will appear at the top of the PDF document
                  </p>
                </div>
              )}


              {/* Table Selection with Ordering (only for framework export) */}
              {exportType === 'framework' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Tables (Drag to reorder for migration creation order)
                    </label>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllTables}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllTables}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                  {(() => {
                    console.log('🔍 Export modal orderedTables:', orderedTables.map(t => `${t.name} (P${t.priority || 'no priority'})`));
                    return orderedTables.map((table, index) => (
                    <div
                      key={table.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, table.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, table.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center p-2 rounded-md border-2 border-dashed transition-colors ${
                        draggedTableId === table.id
                          ? 'border-blue-400 bg-blue-50 opacity-50'
                          : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Drag Handle */}
                      <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                      </div>
                      
                      {/* Order Number */}
                      <div className="mr-3 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </div>
                      
                      {/* Checkbox and Table Info */}
                      <label className="flex items-center flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportConfig.selectedTables.includes(table.name)}
                          onChange={(e) => handleTableSelection(table.name, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {table.name} ({table.columns.length} columns)
                          {table.priority && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded ml-1">
                              P{table.priority}
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                  ));
                  })()}
                </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Drag tables to reorder. Tables will be created in this order to avoid foreign key dependency issues.
                  </div>
                </div>
              )}

              {/* Skip Existing Entities Option (only for framework export) */}
              {exportType === 'framework' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.skipExistingEntities}
                      onChange={(e) => setExportConfig({...exportConfig, skipExistingEntities: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Skip existing entities (prevent conflicts with other modules)
                    </span>
                  </label>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    console.log('Export button clicked, current export type:', exportType);
                    exportDiagram();
                  }}
                  disabled={isExporting || (exportType === 'framework' && exportConfig.selectedTables.length === 0)}
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
                      {exportType === 'framework' && `Export & Download (${exportConfig.selectedTables.length} tables)`}
                      {exportType === 'sql' && 'Export SQL Schema'}
                      {exportType === 'pdf' && 'Export PDF Documentation'}
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