import { useState } from 'react';

//
import { tableData } from 'services/constants/demo';
import { Table, ITable } from 'src/app/components/table';
import { Filter } from 'src/app/components/filter';
import { IFormField } from 'src/app/components/form/form.types';

//
const columns: ITable['columns'] = [
    {
        field: '',
        header: 'S.No.',
        cell: (params) => params.row.index,
    },
    {
        field: 'name',
        header: 'Full Name',
    },
    {
        field: 'email',
        header: 'Email',
    },
    {
        field: 'role',
        header: 'Role',
    },
    {
        field: 'status',
        header: 'Status',
        cell: (params) => (
            <span
                className={`px-2 py-1 text-white text-sm rounded app-shadow ${
                    params.row.status === 'Active'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                }`}
            >
                {params.row.status}
            </span>
        ),
    },
    {
        field: '',
        header: 'Actions',
        cell: () => (
            <div className="flex gap-2">
                <button className="app-button app-shadow">Edit</button>
                <button className="app-button app-shadow">Delete</button>
            </div>
        ),
    },
];

const filterForm = {
    text: {
        label: 'Search Name',
        type: 'text',
        placeHolder: 'Enter name',
        required: false,
    },
    select: {
        label: 'Role',
        type: 'select',
        placeHolder: 'Select role',
        required: false,
        options: [
            { id: '', label: 'All' },
            { id: 'Admin', label: 'Admin' },
            { id: 'User', label: 'User' },
            { id: 'Moderator', label: 'Moderator' },
        ],
    },
} as Record<string, IFormField>;

export const FilterTableDemo = () => {
    const [filteredData, setFilteredData] = useState(tableData);

    const mockApiCall = async (filterString?: string) => {
        let updatedData = tableData;
        const params = new URLSearchParams(filterString);

        const nameFilter = params.get('text')?.toLowerCase();
        const roleFilter = params.get('select');

        if (nameFilter) {
            updatedData = updatedData.filter((item) =>
                item.name.toLowerCase().includes(nameFilter)
            );
        }

        if (roleFilter) {
            updatedData = updatedData.filter(
                (item) => item.role === roleFilter
            );
        }

        return Promise.resolve(updatedData);
    };

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-10">
                Filters
            </h2>
            <Filter
                form={filterForm}
                call={mockApiCall}
                setData={setFilteredData}
            />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-10">
                Filtered Table
            </h2>
            <Table columns={columns} data={filteredData} />
        </div>
    );
};
