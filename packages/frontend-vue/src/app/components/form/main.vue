<template>
    <form
        :class="['grid gap-1 w-auto relative', layoutClass]"
        @submit.prevent="onSubmit"
    >
        <slot name="formTop" />
        <div
            v-for="[fieldName, field] in Object.entries(data || {}).filter(
                ([_, field]) => !field.ref
            )"
            :key="fieldName"
            :class="['w-full', field.alignClass]"
        >
            <slot
                v-if="field.type === 'custom'"
                :name="`${fieldName}Element`"
                :on-field-change="onFieldChange"
            />
            <label v-else-if="field.type === 'label'" :class="field.layoutClass"
                >{{ field.label
                }}<span
                    v-show="field.label && field.required"
                    class="text-red-400 font-bold text-xs"
                    >*</span
                ><slot :name="`${fieldName}Icon`" />
            </label>
            <Calendar
                v-else-if="field.type === 'calendar'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                @onchange="onFieldChange"
            />
            <CheckBox
                v-else-if="field.type === 'checkbox'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :helper-text="field.helperText"
                :layout-class="field.layoutClass"
                :options="field.options || []"
                :custom-field="field.customField"
                @onchange="onFieldChange"
            />
            <ChipMenu
                v-else-if="field.type === 'chip'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :helper-text="field.helperText"
                :layout-class="field.layoutClass"
                :options="field.options || []"
                @onchange="onFieldChange"
            />
            <FileUpload
                v-else-if="field.type === 'file'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :place-holder="field.placeHolder"
                :image-size="field.imageSize"
                :accept="field.accept"
                :size="field.size"
                :max="field.max"
                :class="field.class"
                :layout-class="field.layoutClass"
                :file-size="field.fileSize"
                :cropper="field.cropper"
                @onchange="onFieldChange"
                ><template #uploadIcon>
                    <slot :name="`${fieldName}UploadIcon`" /> </template
            ></FileUpload>
            <MultiField
                v-else-if="field.type === 'multiTextField'"
                :button-text="field.buttonText"
                :button-size="field.buttonSize"
                :name="fieldName"
                :label="field.label"
                :form="form"
                :required="field.required"
                :disabled="field.disabled"
                :place-holder="field.placeHolder"
                :type="field.type"
                :size="field.size"
                :rows="field.rows"
                :min="field.min"
                :max="field.max"
                :class="field.class"
                :layout-class="field.layoutClass"
                :format="field.format"
                :initial-field-count="field.initialFieldCount"
                :remove="field.remove!"
                @onchange="onFieldChange"
            >
                <template #startIcon>
                    <slot :name="`${fieldName}StartIcon`" />
                </template>
                <template #endIcon>
                    <slot :name="`${fieldName}EndIcon`" /> </template
            ></MultiField>
            <RadioButton
                v-else-if="field.type === 'radio'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :helper-text="field.helperText"
                :layout-class="field.layoutClass"
                :options="field.options || []"
                :custom-field="field.customField"
                @onchange="onFieldChange"
            />
            <Toggle
                v-else-if="field.type === 'toggle'"
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :helper-text="field.helperText"
                :layout-class="field.layoutClass"
                @onchange="onFieldChange"
            />
            <TextField
                v-else
                :name="fieldName"
                :label="field.label"
                :value="field.value"
                :options="field.options || []"
                :error="field.error"
                :required="field.required"
                :disabled="field.disabled"
                :place-holder="field.placeHolder"
                :helper-text="field.helperText"
                :type="field.type"
                :size="field.size"
                :rows="field.rows"
                :min="field.min"
                :max="field.max"
                :class="field.class"
                :layout-class="field.layoutClass"
                :format="field.format"
                @onchange="onFieldChange"
            >
                <template #startIcon>
                    <slot :name="`${fieldName}StartIcon`" />
                </template>
                <template #endIcon>
                    <slot :name="`${fieldName}EndIcon`" />
                </template>
            </TextField>
        </div>
        <slot v-if="$slots.formBottom" name="formBottom" />
        <button
            v-else
            :disabled="loading"
            type="submit"
            data-testid="SUBMIT"
            :class="['app-button', loading ? 'text-gray-400' : '', buttonClass]"
            oncontextmenu="return false;"
        >
            {{ buttonText }}
        </button>
        <div
            v-show="loading"
            class="bg-gray-100 bg-opacity-50 dark:bg-transparent absolute w-full h-full rounded-lg flex items-center justify-center"
        >
            <div class="dot-pulse"></div>
        </div>
    </form>
</template>

<script lang="ts">
import type { PropType } from 'vue';

//
import type { IFieldChange, IFormField } from './form.types';
import { getTagValues } from 'services/constants';

//
import Calendar from './calendar.vue';
import CheckBox from './checkBox.vue';
import ChipMenu from './chipMenu.vue';
import FileUpload from './fileUpload.vue';
import MultiField from './multiField.vue';
import RadioButton from './radioButton.vue';
import TextField from './textField.vue';
import Toggle from './toggle.vue';

//
export default {
    name: 'FormBuilder',
    components: {
        Calendar,
        CheckBox,
        ChipMenu,
        FileUpload,
        MultiField,
        RadioButton,
        TextField,
        Toggle,
    },
    props: {
        form: {
            required: true,
            type: Object as PropType<Record<string, IFormField>>,
        },
        call: {
            required: true,
            type: Function as PropType<
                (...args: ILargeRecord) => Promise<boolean>
            >,
        },
        buttonText: {
            default: 'Submit',
            type: String,
        },
        buttonClass: {
            default: '',
            type: String,
        },
        layoutClass: {
            default: '',
            type: String,
        },
    },
    data() {
        return {
            data: {} as Record<string, IFormField>,
            initialData: {} as Record<string, IFormField>,
            loading: false,
            debounceTimer: 0 as ITimer,
        };
    },
    mounted() {
        this.data = this.form;
        this.initialData = { ...this.data };
    },
    methods: {
        getPayload() {
            const payload: Record<string, ILargeRecord> = {};
            for (const key in this.data) {
                if (this.data[key].ref) {
                    const refKey = this.data[key].ref;
                    if (!payload[refKey]) payload[refKey] = [];
                    payload[refKey].push(this.data[key].value);
                } else
                    payload[key] =
                        this.data[key].type === 'tag'
                            ? getTagValues(this.data[key].value)
                            : this.data[key].value;
            }
            return payload;
        },
        onFieldChange(field: IFieldChange) {
            this.data[field.name] = field.ref
                ? {
                      ...this.data[field.ref],
                      ref: field.ref,
                      value: field.value,
                  }
                : {
                      ...this.data[field.name],
                      value: field.value,
                  };

            if (!field.ignoreValidation) {
                if (this.debounceTimer) clearTimeout(this.debounceTimer);

                this.debounceTimer = setTimeout(() => {
                    const fieldData = this.data[field.name];
                    this.validateField(field.name, fieldData);
                }, 500);
            }
        },
        async validateField(name: string, fieldData: IFormField) {
            let errorMessage = '';
            const value = fieldData.value || '';

            if (
                fieldData.required &&
                (fieldData.type === 'tag'
                    ? !value
                          .split(/( |;|,)/g)
                          .filter((t: string) =>
                              t.replaceAll(/(\s|;|,)/g, '').trim()
                          ).length
                    : typeof value === 'object'
                      ? !value.length
                      : !`${value}`.trim())
            ) {
                errorMessage =
                    fieldData.requiredLabel ||
                    `${fieldData.label || 'field'} is required`;
            } else if (fieldData.validations) {
                for (const key in fieldData.validations) {
                    const validation = fieldData.validations[key];
                    const regex = new RegExp(validation.validate as string);
                    if (validation.type === 'function') {
                        const payload = this.getPayload();
                        const call = validation.validate as (
                            values: ILargeRecord,
                            name: string
                        ) => Promise<string> | string;
                        errorMessage = await call(payload, name);
                    } else if (
                        (validation.type === 'regex' &&
                            typeof value === 'object' &&
                            value.filter((v: ILargeRecord) => !regex.test(v))
                                .length) ||
                        (fieldData.type === 'tag'
                            ? value.split(/( |;|,)/g).filter((t: string) => {
                                  const data = t
                                      .replaceAll(/(\s|;|,)/g, '')
                                      .trim();
                                  if (data) return !regex.test(data);
                                  return false;
                              }).length
                            : !regex.test(value))
                    ) {
                        errorMessage = validation.message || 'Invalid value';
                    }
                    if (errorMessage) break;
                }
            }
            this.data[name].error = errorMessage;
        },
        async validate() {
            for (const field in this.data) {
                if (
                    this.data[field].type !== 'label' &&
                    (this.data[field].type !== 'multiTextField' ||
                        (this.data[field].type === 'multiTextField' &&
                            this.data[field].ref))
                )
                    await this.validateField(field, this.data[field]);
            }
            return !Object.values(this.data).filter((f) => Boolean(f.error))
                .length;
        },
        async onSubmit() {
            this.loading = true;
            const payload = this.getPayload();
            if (await this.validate()) {
                const success = await this.call(payload);
                if (success) this.data = this.initialData;
            }
            this.loading = false;
        },
    },
};
</script>
