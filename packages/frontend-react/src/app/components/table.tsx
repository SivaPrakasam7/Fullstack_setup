import { ReactNode, useEffect, useState } from 'react';
import { generateKey } from 'services/repository/utils';
import { TextField } from './form/textField';

export const Table = ({ data, columns }: ITable) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    return (
        <>
            <div className="relative overflow-x-auto !overflow-y-clip rounded-lg app-shadow no-scrollbar flex flex-col">
                <table className="w-full text-sm text-left rtl:text-right rounded-lg">
                    <thead className="bg-primary-200 sticky top-0 bg-gray-200 dark:bg-neutral-900 dark:text-gray-400">
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
                            paginatedData.map((row, index) => (
                                <tr
                                    key={`tablerow-${generateKey()}`}
                                    className={`bg-gray-50 dark:bg-neutral-800 odd:light:bg-white even:bg-gray-100 even:dark:bg-neutral-900 ${
                                        index === paginatedData.length - 1
                                            ? ''
                                            : 'border-b dark:border-neutral-700 border-gray-200'
                                    }`}
                                >
                                    {columns.map((c) => (
                                        <td
                                            key={`tablecell-${generateKey()}`}
                                            className={`px-4 py-4 overflow-hidden w-fit ${c.cellClass ? c.cellClass : ''}`}
                                        >
                                            {c.cell
                                                ? c.cell({
                                                      value: row[c.field],
                                                      row: {
                                                          ...row,
                                                          index:
                                                              (currentPage -
                                                                  1) *
                                                                  itemsPerPage +
                                                              index +
                                                              1,
                                                      },
                                                  })
                                                : row[c.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-gray-50 dark:bg-neutral-800">
                                <td
                                    scope="row"
                                    colSpan={columns.length}
                                    className="px-6 py-10 font-medium col-span-6 text-center text-2xl text-gray-400"
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {data.length > 0 && (
                <div className="flex gap-2 items-center p-2">
                    <p className="text-sm font-bold flex-1">
                        Total : {data.length}
                    </p>
                    <TextField
                        startIcon={
                            <p className="text-gray-500 text-nowrap ml-2 -mr-3">
                                Rows :
                            </p>
                        }
                        name="month"
                        type="select"
                        value={`${itemsPerPage}`}
                        size="p-1.5 pl-4"
                        layoutClass="max-w-32"
                        className="!w-fit mr-2"
                        onChange={(e) => setItemsPerPage(e.value)}
                        options={[
                            { id: '10', label: '10' },
                            { id: '25', label: '25' },
                            { id: '50', label: '50' },
                            { id: '100', label: '100' },
                        ]}
                        noError={true}
                    />
                    <ul className="flex items-center -space-x-px h-10 text-base app-shadow rounded-lg">
                        <li>
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center px-3 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
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
                                    className={`!rounded-none !border-1 !py-1.5 !px-3 ${
                                        currentPage === page
                                            ? 'app-button-fill'
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
                                className={`flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
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
                </div>
            )}
        </>
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
