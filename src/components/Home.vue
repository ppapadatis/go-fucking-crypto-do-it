<template>
    <el-row>
        <el-col :span="24">
            <el-form ref="form" :model="task" :loading="loading" :element-loading-text="loadingText">
                <el-form-item>
                    <el-steps :active="active" finish-status="success">
                        <el-step title="Step 1" description="Set your goal"></el-step>
                        <el-step title="Step 2" description="Set a deadline"></el-step>
                        <el-step title="Step 3" description="Set supervisors"></el-step>
                    </el-steps>              
                </el-form-item>
                <el-form-item label="Goal Description" v-if="active === 0">
                    <el-input
                        autofocus required
                        minlength="1"
                        maxlength="140"
                        type="textarea"
                        resize="none"
                        :rows="2"
                        placeholder="Enter your goal's description here..."
                        name="goal"
                        v-model="task.goal">
                    </el-input>
                    <span class="text-smaller">{{charactersLeft}} characters left.</span>
                </el-form-item>
                <el-form-item label="Pick Deadline" v-if="active === 1">
                    <el-date-picker
                        required
                        :picker-options="datePickerOptions"
                        v-model="task.deadline"
                        type="date"
                        name="deadline"
                        placeholder="Pick a day">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="Supervisors" v-if="active >= 2" v-for="(supervisor, index) in task.supervisors" :key="index">
                    <el-input
                        placeholder="Enter a supervisor address" 
                        name="supervisors[]" 
                        v-model="supervisor.address" 
                        required>
                        </el-input>
                    <el-button @click="removeSuperrvisor(index)" :disabled="task.supervisors.length <= 1">Remove</el-button>
                </el-form-item>
                <el-form-item v-if="active >= 2">
                    <el-button @click="addSupervisor">Add Supervisor</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button @click="prev" :disabled="active < 1">Previous step</el-button>
                    <el-button type="primary" @click="next" name="submit" :disabled="disabledButton" :loading="loading">Next step</el-button>
                    <el-button @click="reset">Reset</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        data() {
            return {
                active: 0,
                loading: false,
                loadingText: 'Please wait until the process is finished successully.\nDo not close or reload this tab!',
                datePickerOptions: {
                    disabledDate (date) {
                        return date <= new Date()
                    }
                },
                task: {
                    goal: '',
                    deadline: '',
                    supervisors: [{ address: '' }],
                }
            };
        },
        computed: {
            charactersLeft() {
                return 140 - this.task.goal.length;
            },
            disabledButton() {
                if (this.active === 0 && this.task.goal.length < 1) {
                    return true;
                }

                if (this.active === 1 && this.task.deadline.length < 1) {
                    return true;
                }

                if (this.active > 1 && this.task.supervisors.length <= 1 && this.task.supervisors.filter((supervisor) => (supervisor.address.length < 1)).length > 0) {
                    return true;
                }

                return false;
            }
        },
        methods: {
            addSupervisor() {
                this.task.supervisors.push({ address: '' });
            },
            removeSuperrvisor(index) {
                this.task.supervisors.splice(index, 1);
            },
            prev() {
                if (this.active > 2) {
                    this.active = 1;
                } else if (this.active > 0) {
                    this.active--;
                }

                document.getElementsByName('submit')[0].innerHTML = "Next step";
            },
            next() {
                event.preventDefault();

                if (this.active >= 3) {
                    this.loading = true;
                }

                if (this.active < 2) {
                    this.active++;
                }
                
                if (this.active > 1) {
                    this.active = 3;
                    event.target.innerHTML = "Create Goal";
                }
            },
            reset() {
                this.active = 0;
                this.task = {goal: '', deadline: '', supervisors: [{ address: '' }]};
                document.getElementsByName('submit')[0].innerHTML = "Next step";
            }
        }
    }
</script>

<style>
    .el-loading-mask {
        white-space: pre-line;
    }
</style>
