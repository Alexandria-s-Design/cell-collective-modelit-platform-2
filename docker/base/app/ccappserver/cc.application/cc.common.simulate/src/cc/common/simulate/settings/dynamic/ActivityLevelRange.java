/**
 * 
 */
package cc.common.simulate.settings.dynamic;

/**
 * @author Bryan
 *
 */
public class ActivityLevelRange {

	private int minimum = 0;

	private int maximum = 100;

	public static ActivityLevelRange getDefault() {
		return new ActivityLevelRange();
	}

	/**
	 * 
	 */
	public ActivityLevelRange() {
	}

	public ActivityLevelRange(int minimum, int maximum) {
		this.minimum = minimum;
		this.maximum = maximum;
	}

	/**
	 * @return the minimum
	 */
	public int getMinimum() {
		return minimum;
	}

	/**
	 * @param minimum
	 *            the minimum to set
	 */
	public void setMinimum(int minimum) {
		this.minimum = minimum;
	}

	/**
	 * @return the maximum
	 */
	public int getMaximum() {
		return maximum;
	}

	/**
	 * @param maximum
	 *            the maximum to set
	 */
	public void setMaximum(int maximum) {
		this.maximum = maximum;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ActivityLevelRange [ ");
		sb.append("minimum = ").append(this.minimum).append(", ");
		sb.append("maximum = ").append(this.maximum).append(" ]");
		return sb.toString();
	}
}