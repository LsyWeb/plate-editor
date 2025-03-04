import { Element, Text } from 'domhandler';
import { TransformOptionType } from './type';
import { cn } from '@/lib/utils';

export const imageElementTramsform = ({
  node,
  children,
}: TransformOptionType) => {
  const align = node.align || 'center';
  return new Element(
    'div',
    {
      class: `relative mt-4 mb-4 py-2 ${align === 'center' ? 'mx-auto' : align === 'left' ? 'float-left' : 'float-right'}`,
      style: `width: ${node.width ? node.width + 'px' : '100%' }`
    },
    [
      new Element('image', {
        src: `${node.url || ''}`,
        alt: `${node.alt}`,
        width: '100%',
        controls: 'true',
        class: 'slate-img w-full rounded-md',
      }),
      new Element(
        'figcaption',
        {
          class: 'slate-figcaption text-center max-w-full mt-2 mb-1',
        },
        [new Text(node.caption?.[0]?.text || '')]
      ),
    ]
  );
};
