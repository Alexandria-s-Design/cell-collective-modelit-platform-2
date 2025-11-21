/**
 * 
 */
package cc.application.main.controller;

/**
 * @author Bryan Kowal
 */
public class MatrixExportException extends Exception {

	private static final long serialVersionUID = 1703499543971730428L;

	public MatrixExportException(String msg, Throwable e) {
		super(msg, e);
	}
}