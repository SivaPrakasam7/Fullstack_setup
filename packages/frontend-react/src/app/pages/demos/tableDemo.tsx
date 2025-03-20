import { tableData } from 'services/constants/demo';
import { ITable, Table } from 'src/app/components/table';

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
        field: 'actions',
        header: 'Actions',
        cell: () => (
            <div className="flex gap-2">
                <button className="app-button app-shadow">Edit</button>
                <button className="app-button app-shadow">Delete</button>
            </div>
        ),
    },
];

export const TableDemo = () => {
    return (
        <div className="flex flex-col gap-6">
            <Table columns={columns} data={tableData} />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-10">
                Without Data
            </h2>
            <Table columns={columns} data={[]} />
        </div>
    );
};
