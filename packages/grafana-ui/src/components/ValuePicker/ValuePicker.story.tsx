import { Meta, StoryFn } from '@storybook/react';

import { getAvailableIcons } from '../../types/icon';
import { generateOptions } from '../Select/mockOptions';

import { ValuePicker } from './ValuePicker';
import mdx from './ValuePicker.mdx';

const meta: Meta<typeof ValuePicker> = {
  title: 'Pickers/ValuePicker',
  component: ValuePicker,
  parameters: {
    docs: {
      page: mdx,
    },
    controls: {
      exclude: ['onChange', 'options'],
    },
  },
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'destructive', 'link'],
      control: {
        type: 'select',
      },
    },
    icon: {
      control: {
        type: 'select',
        options: getAvailableIcons(),
      },
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: {
        type: 'select',
      },
    },
  },
};
const options = generateOptions();

export const Simple: StoryFn<typeof ValuePicker> = (args) => {
  return (
    <div style={{ width: '200px' }}>
      <ValuePicker {...args} options={options} onChange={(v) => console.log(v)} />
    </div>
  );
};
Simple.args = {
  label: 'Pick an option',
  variant: 'primary',
  size: 'md',
  isFullWidth: false,
  icon: 'plus',
  menuPlacement: 'auto',
};

export default meta;
