<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { ComponentOptions } from '../utils'
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Switch as ASwitch,
  Textarea as ATextarea,
  Tooltip as ATooltip,
} from 'ant-design-vue'
import { useDialog } from 'use-dialog-vue3'
import { ref } from 'vue'

const props = defineProps<{
  options: ComponentOptions
}>()

const { visible, close, dismiss } = useDialog()

const optionsForm = ref<ComponentOptions>(props.options)

const rules: Record<string, Rule[]> = {
  inputPath: [
    { required: true, message: '请输入图标文件夹路径', trigger: 'blur' },
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
        <a-form-item name="framework">
          <template #label>
            <span>框架</span>
            <a-tooltip>
              <i class="miconfont micon-hint" m-l-4px></i>
              <template #title>
                <span>在没有指定扩展名和模板的情况下，会根据框架自动选择；指定了扩展名和模板的情况下，会优先使用指定的扩展名和模板。</span>
              </template>
            </a-tooltip>
          </template>
          <a-radio-group v-model:value="optionsForm.framework">
            <a-radio value="vue3">
              Vue3
            </a-radio>
            <a-radio value="vue2">
              Vue2
            </a-radio>
            <a-radio value="react">
              React
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item name="extname" label="文件扩展名">
          <a-input v-model:value="optionsForm.extname" placeholder="请输入文件扩展名"></a-input>
        </a-form-item>
        <a-form-item name="template">
          <template #label>
            <span>文件模板</span>
            <a-tooltip>
              <i class="miconfont micon-hint" m-l-4px></i>
              <template #title>
                <span>占位符：$svgString代表svg字符串，$name代表图标名称</span>
              </template>
            </a-tooltip>
          </template>
          <a-textarea v-model:value="optionsForm.template" placeholder="请输入文件模板" :auto-size="{ minRows: 5, maxRows: 10 }"></a-textarea>
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
