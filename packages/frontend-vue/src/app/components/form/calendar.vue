<template>
    <div class="w-full">
        <label
            :for="name"
            class="block mb-1 text-sm font-bold text-gray-600 dark:text-white"
            >{{ label
            }}<span
                v-show="label && required"
                class="text-red-400 font-bold text-xs"
                >*</span
            ></label
        >
        <div class="flex py-6 justify-between items-center">
            <button
                type="button"
                class="p-2 rounded-full hover:bg-blue-200"
                @click="prevMonth"
            >
                <SvgIcon
                    path="/images/svg/arrowCurve.svg"
                    class="!text-black -rotate-90 !w-6 !h-6"
                    disable-hover="true"
                ></SvgIcon>
            </button>
            <p class="text-xl">{{ currentMonth }}</p>
            <button
                type="button"
                class="p-2 rounded-full hover:bg-blue-200"
                @click="nextMonth"
            >
                <SvgIcon
                    path="/images/svg/arrowCurve.svg"
                    class="!text-black rotate-90 !w-6 !h-6"
                    disable-hover="true"
                ></SvgIcon>
            </button>
        </div>
        <div class="grid grid-cols-7 gap-2 h-12">
            <div
                v-for="day in weekdays"
                :key="day"
                class="flex items-center justify-center uppercase text-md text-gray-350"
            >
                {{ day }}
            </div>
        </div>
        <div class="grid grid-cols-7 gap-2 h-[35dvh]">
            <div
                v-for="(day, index) in days"
                :key="index"
                :class="{
                    'h-12 flex items-center justify-center cursor-pointer': true,
                    'bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center cursor-pointer':
                        isSelected(+day),
                    'text-gray-600 cursor-not-allowed': isPastDay(+day),
                }"
                @click="selectDate(+day)"
            >
                {{ day ? day : '' }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SvgIcon from '../svg.vue';

export default {
    name: 'CalendarView',
    components: { SvgIcon },
    props: {
        name: {
            required: true,
            type: String,
        },
        label: {
            default: '',
            type: String,
        },
        value: {
            type: Date,
            default: '',
        },
        error: {
            default: '',
            type: String,
        },
        disabled: {
            default: false,
            type: Boolean,
        },
        required: {
            default: false,
            type: Boolean,
        },
    },
    emits: ['onchange'],
    data() {
        return {
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekdaysLabel: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ],
        };
    },
    computed: {
        currentMonth() {
            return this.value.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            });
        },
        days(): (number | string)[] {
            if (!this.value) return [];
            const daysInMonth = new Date(
                this.value.getFullYear(),
                this.value.getMonth() + 1,
                0
            ).getDate();
            const days = [];

            const startDay = new Date(
                this.value.getFullYear(),
                this.value.getMonth(),
                1
            ).getDay();

            for (let i = 0; i < startDay; i++) {
                days.push('');
            }

            for (let i = 1; i <= daysInMonth; i++) {
                days.push(i);
            }

            return days;
        },
    },
    mounted() {
        this.selectDate(this.value.getDate());
    },
    methods: {
        prevMonth() {
            const previousMonth = this.value.getMonth() - 1;
            const currentDate = new Date();
            if (previousMonth >= currentDate.getMonth()) {
                this.$emit('onchange', {
                    name: this.name,
                    value: new Date(
                        this.value.getFullYear(),
                        this.value.getMonth() - 1,
                        currentDate.getMonth() === previousMonth
                            ? currentDate.getDate()
                            : 1
                    ),
                });
            }
        },
        nextMonth() {
            this.$emit('onchange', {
                name: this.name,
                value: new Date(
                    this.value.getFullYear(),
                    this.value.getMonth() + 1,
                    1
                ),
            });
        },
        isPastDay(day: number) {
            const today = new Date();

            if (!this.value) {
                console.error('selectedDate is not set or is invalid');
                return false;
            }

            const todayDateOnly = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            const selectedDay = new Date(
                this.value.getFullYear(),
                this.value.getMonth(),
                day
            );

            const selectedDayDateOnly = new Date(
                selectedDay.getFullYear(),
                selectedDay.getMonth(),
                selectedDay.getDate()
            );

            const isPast = selectedDayDateOnly < todayDateOnly;

            return isPast;
        },
        isSelected(day: number) {
            return this.value && this.value.getDate() === day;
        },
        async selectDate(day: number) {
            if (day !== null && day.toString() !== '') {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const newDate = new Date(
                    this.value.getFullYear(),
                    this.value.getMonth(),
                    day
                );

                if (
                    newDate.getTime() !== this.value.getTime() &&
                    newDate.getTime() >= currentDate.getTime()
                ) {
                    this.$emit('onchange', { name: this.name, value: newDate });
                }
            }
        },
    },
};
</script>
