//
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

//
import { IFieldChange, IFormField } from 'src/app/components/form/form.types';
import { FormElements } from './form/main';
import { getTagValues } from 'services/constants';

//
export const Filter = ({
    form,
    call,
    setData,
}: {
    form: Record<string, IFormField>;
    call(filter?: string): Promise<ILargeRecord[]>;
    setData: Dispatch<SetStateAction<ILargeRecord[]>>;
}) => {
    const [data, _setData] = useState<Record<string, IFormField>>({});
    const [debounceTimer, setDebounceTimer] = useState(0);

    const onFieldChange = async (field: IFieldChange) => {
        _setData((_data) => {
            _data[field.name] = field.ref
                ? { ..._data[field.ref], ref: field.ref, value: field.value }
                : { ..._data[field.name], value: field.value };

            return _data;
        });

        if (debounceTimer) clearTimeout(debounceTimer);

        setDebounceTimer(
            setTimeout(() => {
                const payload = getPayload();
                call(
                    Object.entries(payload)
                        .filter(([_, value]) => Boolean(value))
                        .map(([key, value]) => {
                            let formattedValue = '';
                            if (key.toLowerCase().includes('date')) {
                                if (key === 'startDate') {
                                    formattedValue = new Date(
                                        `${value}T00:00:00`
                                    ).toISOString();
                                } else if (key === 'endDate') {
                                    formattedValue = new Date(
                                        `${value}T23:59:59`
                                    ).toISOString();
                                }
                            }
                            return `${key}=${encodeURIComponent(formattedValue || value)}`;
                        })
                        .join('&')
                ).then(setData);
            }, 500)
        );
    };

    const getPayload = () => {
        const payload: Record<string, ILargeRecord> = {};
        for (const key in data) {
            if (data[key].ref) {
                const refKey = data[key].ref;
                if (!payload[refKey]) payload[refKey] = [];
                payload[refKey].push(data[key].value);
            } else
                payload[key] =
                    data[key].type === 'tag'
                        ? getTagValues(data[key].value)
                        : data[key].value;
        }
        return payload;
    };

    useEffect(() => {
        _setData({ ...form });

        const payload: Record<string, ILargeRecord> = {};

        for (const key in form) {
            if (form[key]?.ref) {
                const refKey = form[key]?.ref;
                if (!payload[refKey]) payload[refKey] = [];
                payload[refKey].push(form[key].value);
            } else
                payload[key] =
                    form[key].type === 'tag'
                        ? getTagValues(form[key].value)
                        : form[key].value;
        }

        const timer = setTimeout(() => {
            call(
                Object.entries(payload)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key, value]) => {
                        let formattedValue = '';
                        if (key.toLowerCase().includes('date')) {
                            if (key === 'startDate') {
                                formattedValue = new Date(
                                    `${value}T00:00:00`
                                ).toISOString();
                            } else if (key === 'endDate') {
                                formattedValue = new Date(
                                    `${value}T23:59:59`
                                ).toISOString();
                            } else formattedValue = value;
                        }
                        return `${key}=${encodeURIComponent(formattedValue)}`;
                    })
                    .join('&')
            ).then(setData);
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [form]);

    return (
        <div className="flex max-sm:flex-col items-center gap-2">
            {Object.entries(data || {})
                .filter(([_, field]) => !field.ref)
                .map(([fieldName, field]) => (
                    <div
                        key={fieldName}
                        className={`w-full ${field.alignClass}`}
                    >
                        <FormElements
                            fieldName={fieldName}
                            field={field}
                            onFieldChange={onFieldChange}
                        />
                    </div>
                ))}
        </div>
    );
};
