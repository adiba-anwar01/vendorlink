import { Component } from 'react';
import { Map } from 'lucide-react';

export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-blue-50">
          <Map className="w-8 h-8 text-blue-300" />
          <p className="text-sm font-medium text-blue-400">Map could not load</p>
          <p className="text-xs text-blue-300">Items are still shown below</p>
        </div>
      );
    }
    return this.props.children;
  }
}
