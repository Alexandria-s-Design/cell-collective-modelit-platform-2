/**
 * 
 */
package cc.application.simulation;

import java.util.Random;

/**
 * @author Bryan Kowal
 *
 */
public class RandomUtil {

	private static final RandomUtil instance = new RandomUtil();

	private static final Random random = new Random(System.currentTimeMillis());

	protected RandomUtil() {
	}

	public static RandomUtil getInstance() {
		return instance;
	}

	public int getRandomIntInRange(final int min, final int max) {
		return random.nextInt((max - min) + 1) + min;
	}
	
	public int getRandomInt(final int max) {
		return random.nextInt(max);
	}
}