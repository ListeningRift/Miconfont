<script setup lang="ts">
import type { FontOptions } from '@miconfont/convert'
import type { Rule } from 'ant-design-vue/es/form'
import { Form as AForm, FormItem as AFormItem, Input as AInput, Modal as AModal, Radio as ARadio, RadioGroup as ARadioGroup, Switch as ASwitch } from 'ant-design-vue'
import { useDialog } from 'use-dialog-vue3'
import { ref } from 'vue'

const props = defineProps<{
  options: FontOptions & { inputPath: string, configPath: string, mode: 'form' | 'file' }
}>()

const { visible, close, dismiss } = useDialog()

const optionsForm = ref<FontOptions & { inputPath: string, configPath: string, mode: 'form' | 'file' }>(props.options)

const rules: Record<string, Rule[]> = {
  inputPath: [
    { required: true, message: '请输入图标文件夹路径', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入字体名称', trigger: 'blur' },
  ],
  iconPrefix: [
    { required: true, message: '请输入图标前缀', trigger: 'blur' },
  ],
  configPath: [
    { required: true, message: '请输入配置文件路径', trigger: 'blur' },
  ],
}

const formRef = ref()
function submit() {
  formRef.value.validate().then(() => {
    close(optionsForm)
  })
}
</script>

<template>
  <a-modal
    v-model:visible="visible"
    width="600px"
    centered
    :mask-closable="false"
    title="设置"
    ok-text="确定"
    cancel-text="取消"
    @ok="submit"
    @cancel="dismiss"
  >
    <a-form ref="formRef" :model="optionsForm" :label-col="{ span: 5 }" :rules="rules">
      <a-form-item name="inputPath" label="图标文件夹">
        <a-input v-model:value="optionsForm.inputPath" placeholder="图标文件夹"></a-input>
      </a-form-item>

      <a-form-item name="mode" label="配置方式">
        <a-radio-group v-model:value="optionsForm.mode">
          <a-radio value="form">
            表单设置
          </a-radio>
          <a-radio value="file">
            配置文件
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <template v-if="optionsForm.mode === 'form'">
        <a-form-item name="name" label="字体名称">
          <a-input v-model:value="optionsForm.name" placeholder="请输入字体名称"></a-input>
        </a-form-item>
        <a-form-item name="iconPrefix" label="图标前缀">
          <a-input v-model:value="optionsForm.iconPrefix" placeholder="请输入图标前缀"></a-input>
        </a-form-item>
        <a-form-item name="clearColor" label="是否清除颜色">
          <a-switch v-model:checked="optionsForm.clearColor"></a-switch>
        </a-form-item>
      </template>
      <template v-if="optionsForm.mode === 'file'">
        <a-form-item name="configPath" label="配置文件路径">
          <a-input v-model:value="optionsForm.configPath" placeholder="请输入配置文件路径"></a-input>
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<style lang="less" scoped>

</style>
