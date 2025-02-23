import { ReactNode, useState } from 'react';
import { generateKey } from 'services/repository/utils';

export const Table = ({ data, columns }: ITable) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Adjust this value as needed

    // Calculate total pages
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Get current page data
    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Pagination handlers
    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Generate page numbers (e.g., show 5 pages around current)
    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, currentPage - half);
        const end = Math.min(totalPages, start + maxPagesToShow - 1);

        if (end - start + 1 < maxPagesToShow) {
            start = Math.max(1, end - maxPagesToShow + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <div className="relative overflow-x-auto rounded-md border no-scrollbar flex flex-col bg-white">
            <table className="w-full text-sm text-left rtl:text-right rounded-md">
                <thead className="bg-gray-300 sticky top-0">
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={`headcol-${generateKey()}`}
                                scope="col"
                                className="px-4 py-4 truncate"
                            >
                                {c.headerCell ? c.headerCell : c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length ? (
                        paginatedData.map((row) => (
                            <tr
                                key={`tablerow-${generateKey()}`}
                                className={`bg-white dark:bg-gray-800 hover:bg-blue-50 border-b dark:border-gray-700 border-gray-200`}
                            >
                                {columns.map((c) => (
                                    <td
                                        key={`tablecell-${generateKey()}`}
                                        className={`px-4 py-4 overflow-hidden w-fit ${c.cellClass ? c.cellClass : ''}`}
                                    >
                                        {c.cell
                                            ? c.cell({
                                                  value: row[c.field],
                                                  row,
                                              })
                                            : row[c.field]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr className="bg-white dark:bg-gray-800 hover:bg-blue-50">
                            <td
                                scope="row"
                                colSpan={columns.length}
                                className="px-6 py-4 font-medium col-span-6 text-center text-2xl text-gray-400"
                            >
                                No data found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {data.length > 0 && (
                <div className="flex gap-2 items-center justify-between p-2">
                    <p className="text-sm font-bold">Total : {data.length}</p>
                    <nav>
                        <ul className="flex items-center -space-x-px h-10 text-base">
                            <li>
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                                        currentPage === 1
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                    }`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg
                                        className="w-3 h-3 rtl:rotate-180"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 6 10"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 1 1 5l4 4"
                                        />
                                    </svg>
                                </button>
                            </li>
                            {getPageNumbers().map((page) => (
                                <li key={`page-${page}`}>
                                    <button
                                        onClick={() => goToPage(page)}
                                        className={`!rounded-none !border-1 ${
                                            currentPage === page
                                                ? 'app-button-fill '
                                                : 'app-button'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                                        currentPage === totalPages
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    <svg
                                        className="w-3 h-3 rtl:rotate-180"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 6 10"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 9 4-4-4-4"
                                        />
                                    </svg>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export interface ITable {
    columns: {
        header?: string;
        field: string;
        headerCell?: ReactNode;
        cell?: (params: { value: string; row: ILargeRecord }) => ReactNode;
        cellClass?: string;
    }[];
    data: ILargeRecord[];
}
