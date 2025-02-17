import { ReactNode } from 'react';
import { generateKey } from 'services/repository/utils';

//
export const Table = ({ data, columns }: ITable) => {
    return (
        <div className="relative overflow-x-auto rounded-md border no-scrollbar">
            <table className="w-full text-sm text-left rtl:text-right rounded-md">
                <thead className="bg-gray-300 sticky top-0">
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={`headcol-${generateKey()}`}
                                scope="col"
                                className="px-2 py-4 truncate"
                            >
                                {c.headerCell ? c.headerCell : c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length ? (
                        data.map((row, rowIndex) => (
                            <tr
                                key={`tablerow-${generateKey()}`}
                                className={`bg-white dark:bg-gray-800 hover:bg-blue-50 ${
                                    rowIndex === data.length - 1
                                        ? ''
                                        : 'border-b dark:border-gray-700 border-gray-200'
                                }`}
                            >
                                {columns.map((c) => (
                                    <td
                                        key={`tablecell-${generateKey()}`}
                                        className={`px-2 py-4 overflow-hidden w-fit ${c.cellClass ? c.cellClass : ''}`}
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
