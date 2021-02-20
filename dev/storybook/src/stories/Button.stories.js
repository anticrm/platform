import Button from './Button.svelte'
import ThemeDecorator from './ThemeDecorator.svelte'

export default {
  title: 'Platform/Button',
  component: Button,
  argTypes: {
    size: {
      control: { type: 'select', options: ['small', 'default', 'large'] },
    },
    kind: {
      control: { type: 'select', options: ['primary', 'default', 'transparent'] },
    },
    width: { control: 'text' },
    content: { control: 'text' },
    onClick: { action: 'onClick' },
  },
  decorators:  [(storyFn) => {
    const story = storyFn();

    return {
      Component: ThemeDecorator,
      props: {
        child: story.Component,
        props: story.props,
      }
    }
  }]
}

const Template = ({ onClick, ...args }) => ({
  Component: Button,
  props: { content: 'Button', ...args },
  on: {
    click: onClick,
  },
});

export const Primary = Template.bind({});
Primary.args = {
  kind: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {

};

export const Large = Template.bind({});
Large.args = {
  size: 'large'
};

export const Small = Template.bind({});
Small.args = {
  size: 'small'
};

export const Transparent = Template.bind({});
Transparent.args = {
  kind: 'transparent'
};